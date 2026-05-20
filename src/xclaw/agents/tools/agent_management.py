# -*- coding: utf-8 -*-
"""HTTP helpers and tools for listing agents and inter-agent chat."""

import asyncio
import json
import logging
import time
import uuid
from typing import Any, Callable, Dict, Optional, Set, Tuple

import httpx
from agentscope.message import TextBlock
from agentscope.tool import ToolResponse

from ...config.utils import read_last_api
from ...utils.http import trust_env_for_url

logger = logging.getLogger(__name__)

DEFAULT_AGENT_API_BASE_URL = "http://127.0.0.1:8088"


def create_agent_api_client(
    base_url: str,
    timeout: float = 30.0,
) -> httpx.Client:
    """HTTP client with paths relative to ``/api``."""
    base = (base_url or "").rstrip("/")
    if not base.endswith("/api"):
        base = f"{base}/api"
    return httpx.Client(
        base_url=base,
        timeout=timeout,
        trust_env=trust_env_for_url(base),
    )


def resolve_agent_api_base_url() -> str:
    """Resolve API origin (no ``/api`` suffix) from last CLI/server binding."""
    last = read_last_api()
    if last:
        host, port = last
        return f"http://{host}:{port}"
    return DEFAULT_AGENT_API_BASE_URL


def _normalize_agent_id(raw: str) -> str:
    s = (raw or "").strip()
    if len(s) >= 2 and (
        (s[0] == s[-1] == '"') or (s[0] == s[-1] == "'")
    ):
        s = s[1:-1].strip()
    return s.strip()


def resolve_calling_agent_id(from_agent: Optional[str] = None) -> str:
    if from_agent is not None and str(from_agent).strip():
        return _normalize_agent_id(str(from_agent))
    from ...app.agent_context import get_current_agent_id

    return get_current_agent_id()


def extract_agent_ids(data: Dict[str, Any]) -> Set[str]:
    out: Set[str] = set()
    for item in data.get("agents") or []:
        if not isinstance(item, dict):
            continue
        aid = item.get("id")
        if isinstance(aid, str) and aid.strip():
            out.add(_normalize_agent_id(aid))
    return out


def list_agents_data(base_url: str, timeout: float = 30.0) -> Dict[str, Any]:
    with create_agent_api_client(base_url, timeout) as client:
        response = client.get("/agents")
        response.raise_for_status()
        return response.json()


def agent_exists(to_agent: str, base_url: Optional[str] = None) -> bool:
    to_id = _normalize_agent_id(to_agent)
    origin = base_url if base_url is not None else resolve_agent_api_base_url()
    try:
        data = list_agents_data(origin)
    except Exception as exc:
        logger.debug("agent_exists: list failed: %s", exc)
        return False
    return to_id in extract_agent_ids(data)


def build_agent_chat_request(
    to_agent: str,
    text: str,
    *,
    session_id: Optional[str] = None,
    from_agent: Optional[str] = None,
) -> Tuple[str, Dict[str, Any], bool]:
    from_id = resolve_calling_agent_id(from_agent)
    to_id = _normalize_agent_id(to_agent)
    prefix = f"[Agent {from_id} requesting] "
    if (text or "").startswith(prefix):
        body_text = text
        prefix_added = False
    else:
        body_text = prefix + (text or "")
        prefix_added = True

    if session_id and session_id.strip():
        sid = session_id.strip()
    else:
        sid = (
            f"{from_id}:to:{to_id}:"
            f"{int(time.time() * 1000)}:{uuid.uuid4().hex[:8]}"
        )

    payload: Dict[str, Any] = {
        "session_id": sid,
        "input": [
            {
                "role": "user",
                "type": "message",
                "content": [{"type": "text", "text": body_text}],
            },
        ],
        "stream": True,
    }
    return sid, payload, prefix_added


def extract_agent_text_content(response_data: Dict[str, Any]) -> str:
    """Extract concatenated text blocks from an agent response payload.

    Searches backwards through output for the last ``message``-type item
    so that trailing reasoning / tool-output items are skipped.
    """
    output = response_data.get("output", [])
    if not output:
        return ""

    last_msg = None
    for msg in reversed(output):
        if isinstance(msg, dict) and msg.get("type", "message") == "message":
            last_msg = msg
            break

    if not last_msg:
        return ""

    text_parts: list[str] = []
    for c in last_msg.get("content") or []:
        if isinstance(c, dict) and c.get("type") == "text":
            t = c.get("text") or ""
            if t:
                text_parts.append(str(t))
    return "\n".join(text_parts) if text_parts else ""


def collect_final_agent_chat_response(
    base_url: str,
    request_payload: Dict[str, Any],
    to_agent: str,
    timeout: float,
) -> Optional[Dict[str, Any]]:
    to_id = _normalize_agent_id(to_agent)
    headers = {"X-Agent-Id": to_id}
    last_data: Optional[Dict[str, Any]] = None
    with create_agent_api_client(base_url, timeout) as client:
        with client.stream(
            "POST",
            "/agent/process",
            json=request_payload,
            headers=headers,
            timeout=timeout,
        ) as resp:
            resp.raise_for_status()
            for line in resp.iter_lines():
                if not line:
                    continue
                if isinstance(line, bytes):
                    line = line.decode("utf-8", errors="replace")
                if line.startswith("data:"):
                    raw = line[5:].strip()
                    try:
                        last_data = json.loads(raw)
                    except json.JSONDecodeError:
                        continue
    return last_data


def stream_agent_chat(
    base_url: str,
    request_payload: Dict[str, Any],
    to_agent: str,
    timeout: float,
    line_handler: Callable[[str], None],
) -> None:
    to_id = _normalize_agent_id(to_agent)
    headers = {"X-Agent-Id": to_id}
    with create_agent_api_client(base_url, timeout) as client:
        with client.stream(
            "POST",
            "/agent/process",
            json=request_payload,
            headers=headers,
            timeout=timeout,
        ) as resp:
            resp.raise_for_status()
            for line in resp.iter_lines():
                if not line:
                    continue
                if isinstance(line, bytes):
                    line = line.decode("utf-8", errors="replace")
                line_handler(line)


def submit_agent_chat_task(
    base_url: str,
    request_payload: Dict[str, Any],
    to_agent: str,
    timeout: float,
    task_timeout: Optional[float] = None,
) -> Dict[str, Any]:
    to_id = _normalize_agent_id(to_agent)
    headers = {"X-Agent-Id": to_id}
    payload = dict(request_payload)
    if task_timeout is not None:
        payload["timeout"] = task_timeout
    with create_agent_api_client(base_url, timeout) as client:
        response = client.post(
            "/agent/process/task",
            json=payload,
            headers=headers,
        )
        response.raise_for_status()
        return response.json()


def get_agent_chat_task_status(
    base_url: Optional[str],
    task_id: str,
    *,
    to_agent: Optional[str] = None,
    timeout: float = 10.0,
) -> Dict[str, Any]:
    origin = resolve_agent_api_base_url() if base_url is None else base_url
    headers: Dict[str, str] = {}
    if to_agent:
        headers["X-Agent-Id"] = _normalize_agent_id(to_agent)
    with create_agent_api_client(origin, timeout) as client:
        response = client.get(
            f"/agent/process/task/{task_id}",
            headers=headers,
        )
        response.raise_for_status()
        return response.json()


def _format_task_status_message(task_id: str, status_body: Dict[str, Any]) -> str:
    lines = [f"[TASK_ID: {task_id}]", ""]
    st = status_body.get("status", "unknown")
    if st != "finished":
        lines.append(f"Status: {st}")
        return "\n".join(lines)

    result = status_body.get("result")
    if isinstance(result, dict):
        inner = extract_agent_text_content(result)
        if inner:
            lines.append(inner)
        elif result.get("status") == "failed":
            lines.append(str(result.get("error", "Task failed")))
        else:
            lines.append(json.dumps(result, ensure_ascii=False))
    elif result is not None:
        lines.append(str(result))
    return "\n".join(lines)


async def list_agents() -> ToolResponse:
    base = resolve_agent_api_base_url()
    data = await asyncio.to_thread(list_agents_data, base)
    text = json.dumps(data, ensure_ascii=False, indent=2)
    return ToolResponse(
        content=[TextBlock(type="text", text=text)],
    )


async def chat_with_agent(
    to_agent: str,
    text: str,
    from_agent: Optional[str] = None,
    background: bool = False,
    task_id: Optional[str] = None,
    session_id: Optional[str] = None,
    timeout: float = 300.0,
    task_timeout: Optional[float] = None,
) -> ToolResponse:
    base = resolve_agent_api_base_url()

    if background and task_id:
        status = await asyncio.to_thread(
            get_agent_chat_task_status,
            base,
            task_id,
            to_agent=to_agent,
            timeout=min(timeout, 120.0),
        )
        body = _format_task_status_message(task_id, status)
        return ToolResponse(
            content=[TextBlock(type="text", text=body)],
        )

    if not await asyncio.to_thread(agent_exists, to_agent, base):
        aid = _normalize_agent_id(to_agent)
        return ToolResponse(
            content=[TextBlock(type="text", text=f"Agent [{aid}] not exists")],
        )

    sid, payload, _ = build_agent_chat_request(
        to_agent,
        text,
        session_id=session_id,
        from_agent=from_agent,
    )

    if background:
        submitted = await asyncio.to_thread(
            submit_agent_chat_task,
            base,
            payload,
            to_agent,
            timeout,
            task_timeout,
        )
        tid = submitted.get("task_id", "")
        msg = (
            f"[TASK_ID: {tid}]\n[SESSION: {sid}]\n\n"
            f"{submitted.get('message', 'Task submitted.')}"
        )
        return ToolResponse(
            content=[TextBlock(type="text", text=msg)],
        )

    final = await asyncio.to_thread(
        collect_final_agent_chat_response,
        base,
        payload,
        to_agent,
        timeout,
    )
    out_text = (
        extract_agent_text_content(final)
        if final
        else "(No response received)"
    )
    return ToolResponse(
        content=[TextBlock(type="text", text=out_text)],
    )
