# -*- coding: utf-8 -*-
"""Tool to call supOS Open API in-process (no external `python` needed).

This avoids relying on a system Python executable when running the
desktop exe built by PyInstaller.
"""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any, Optional

import requests
from agentscope.message import TextBlock
from agentscope.tool import ToolResponse

from ...constant import WORKING_DIR
from ...security.xclaw_env_crypto import decrypt_from_b64


def _load_supos_url() -> str:
    """Load `supos_url` from `supos_config.json` under CoPaw working dir."""
    cfg_path = Path(WORKING_DIR) / "supos_config.json"
    if not cfg_path.is_file():
        raise RuntimeError(
            f"supOS 平台地址未配置：缺少文件 {cfg_path}（请在 xClaw 界面先设置 supos_url）。",
        )
    cfg = json.loads(cfg_path.read_text(encoding="utf-8"))
    url = (cfg.get("supos_url") or "").rstrip("/")
    if not url:
        raise RuntimeError(
            f"supos_url 为空：请在 xClaw 界面先设置 supos_url（文件 {cfg_path}）。",
        )
    return url


def _load_supOS_ak() -> str:
    ak = (os.environ.get("SUPOS_AK") or "").strip()
    if not ak:
        enc = (os.environ.get("SUPOS_AK_ENC") or "").strip()
        if enc:
            try:
                ak = decrypt_from_b64(enc).strip()
                if ak:
                    os.environ["SUPOS_AK"] = ak
            except Exception:
                ak = ""
    if not ak:
        raise RuntimeError(
            "未找到 SUPOS_AK 环境变量（Open API 认证所需）。"
            "请在启动目录放置 xclaw.env，或在 CoPaw 设置/配置里保存 SUPOS_AK。"
        )
    return ak


async def supos_api_call(
    method: str,
    path: str,
    data: Any = None,
) -> ToolResponse:
    """Call supOS Open API using `SUPOS_AK` (Bearer).

    Args:
        method: `get|post|put|delete`
        path: API path beginning with `/os/open-api/...`
        data:
            - for `get`: query params (dict) or JSON string
            - for `post|put`: request body (dict) or JSON string
            - for `delete`: optional query params (dict) or JSON string
    """
    try:
        ak = _load_supOS_ak()
        supos_url = _load_supos_url()
        url = f"{supos_url}{path}"
        headers = {"Authorization": f"Bearer {ak}"}

        payload: Optional[Any] = None
        if isinstance(data, str):
            s = data.strip()
            if s:
                # Allow callers to pass either `{"a":1}` or raw token-like strings.
                payload = json.loads(s)
        elif data is not None:
            payload = data

        method_l = (method or "").lower().strip()
        if method_l == "get":
            r = requests.get(
                url,
                headers=headers,
                params=payload if isinstance(payload, dict) else None,
                timeout=10,
                verify=False,
            )
        elif method_l == "post":
            r = requests.post(
                url,
                headers=headers,
                json=payload if payload is not None else None,
                timeout=10,
                verify=False,
            )
        elif method_l == "put":
            r = requests.put(
                url,
                headers=headers,
                json=payload if payload is not None else None,
                timeout=10,
                verify=False,
            )
        elif method_l == "delete":
            r = requests.delete(
                url,
                headers=headers,
                params=payload if isinstance(payload, dict) else None,
                timeout=10,
                verify=False,
            )
        else:
            return ToolResponse(
                content=[
                    TextBlock(
                        type="text",
                        text=f"Error: unsupported method {method!r}. Use get/post/put/delete.",
                    ),
                ],
            )

        if r.status_code == 401:
            raise RuntimeError("认证失败：SUPOS_AK 无效或已过期（401）。")
        if r.status_code == 400:
            try:
                err = r.json()
                raise RuntimeError(f"参数错误: {err.get('message', r.text[:200])}")
            except Exception:
                raise RuntimeError(f"参数错误: {r.text[:200]}")
        if r.status_code == 502:
            raise RuntimeError("无法连接 supOS 平台，请检查平台地址和网络（502）。")
        if r.status_code not in (200, 204):
            raise RuntimeError(f"请求失败 {r.status_code}: {r.text[:300]}")

        body = r.json() if r.content else {}
        return ToolResponse(
            content=[TextBlock(type="text", text=json.dumps(body, ensure_ascii=False, indent=2))],
        )
    except Exception as e:
        return ToolResponse(
            content=[TextBlock(type="text", text=f"Error: {e}")],
        )

