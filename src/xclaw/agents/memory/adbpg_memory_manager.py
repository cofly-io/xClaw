# -*- coding: utf-8 -*-
"""ADBPG long-term memory layered on top of ReMeLight.

ReMeLight continues to provide session memory, compaction, and
``get_in_memory_memory()`` for the agent runtime. When ``adbpg_memory_config``
is present, this manager additionally searches AnalyticDB (ADBPG) from the
``memory_search`` tool and optionally persists user turns after summarization.
"""
from __future__ import annotations

import asyncio
import logging
import threading

from agentscope.message import Msg, TextBlock
from agentscope.tool import ToolResponse

from ...config.config import load_agent_config
from .adbpg_client import (
    ADBPGConfig,
    ADBPGMemoryClient,
    ConfigurationError,
    reset_configured_connections,
)
from .reme_light_memory_manager import ReMeLightMemoryManager

logger = logging.getLogger(__name__)


def _memory_search_text(resp: ToolResponse) -> str:
    """Flatten ToolResponse text for merging."""
    parts: list[str] = []
    for blk in getattr(resp, "content", None) or []:
        if getattr(blk, "type", None) == "text":
            parts.append(getattr(blk, "text", "") or "")
    return "\n".join(parts).strip()


class ADBPGMemoryManager(ReMeLightMemoryManager):
    """ReMeLight session memory + optional ADBPG semantic long-term store."""

    def __init__(self, working_dir: str, agent_id: str) -> None:
        super().__init__(working_dir=working_dir, agent_id=agent_id)
        self._adbpg_config = None
        self._client: ADBPGMemoryClient | None = None
        self._effective_agent_id: str = "shared"
        self._effective_user_id: str = "shared"
        self._effective_run_id: str = "shared"

    async def start(self) -> None:
        await super().start()
        self._setup_adbpg_client()

    async def close(self) -> bool:
        self._client = None
        try:
            reset_configured_connections()
        except Exception as exc:  # noqa: BLE001
            logger.debug("ADBPG reset_configured_connections: %s", exc)
        return await super().close()

    def _setup_adbpg_client(self) -> None:
        agent_config = load_agent_config(self.agent_id)
        self._adbpg_config = getattr(
            agent_config.running,
            "adbpg_memory_config",
            None,
        )
        if not self._adbpg_config:
            logger.info(
                "ADBPG disabled for agent '%s' (no adbpg_memory_config).",
                self.agent_id,
            )
            self._client = None
            return

        cfg = self._adbpg_config
        self._effective_agent_id = (
            self.agent_id if cfg.memory_isolation else "shared"
        )

        try:
            api_mode = getattr(cfg, "api_mode", "sql")
            if api_mode == "rest":
                if not cfg.rest_api_key:
                    raise ConfigurationError(
                        "ADBPG REST API key not configured.",
                    )
            elif not cfg.host:
                raise ConfigurationError("ADBPG host not configured.")

            adb_cfg = ADBPGConfig(
                host=cfg.host,
                port=cfg.port,
                user=cfg.user,
                password=cfg.password,
                dbname=cfg.dbname,
                llm_model=cfg.llm_model,
                llm_api_key=cfg.llm_api_key,
                llm_base_url=cfg.llm_base_url,
                embedding_model=cfg.embedding_model,
                embedding_api_key=cfg.embedding_api_key,
                embedding_base_url=cfg.embedding_base_url,
                embedding_dims=cfg.embedding_dims,
                search_timeout=cfg.search_timeout,
                pool_minconn=cfg.pool_minconn,
                pool_maxconn=cfg.pool_maxconn,
                memory_isolation=cfg.memory_isolation,
                api_mode=api_mode,
                rest_api_key=cfg.rest_api_key,
                rest_base_url=cfg.rest_base_url,
            )
        except Exception as exc:  # noqa: BLE001
            logger.warning(
                "ADBPG config incomplete for agent '%s': %s. "
                "ADBPG search disabled; ReMeLight still active.",
                self.agent_id,
                exc,
            )
            self._client = None
            return

        try:
            reset_configured_connections()
            client = ADBPGMemoryClient(adb_cfg)
            client.configure()
            self._client = client
            logger.info("ADBPG client connected for agent '%s'.", self.agent_id)
        except Exception as exc:  # noqa: BLE001
            logger.warning(
                "Failed to connect ADBPG for agent '%s': %s",
                self.agent_id,
                exc,
            )
            self._client = None

    # ------------------------------------------------------------------
    # memory_search: ReMeLight vector/FTS + ADBPG semantic hits
    # ------------------------------------------------------------------

    async def memory_search(
        self,
        query: str,
        max_results: int = 5,
        min_score: float = 0.1,
    ) -> ToolResponse:
        adb_text = ""
        if self._client is not None:
            try:
                loop = asyncio.get_event_loop()
                results = await loop.run_in_executor(
                    None,
                    lambda: self._client.search_memory(
                        query=query,
                        user_id=self._effective_user_id,
                        agent_id=self._effective_agent_id,
                        limit=max_results,
                    ),
                )
                parts: list[str] = []
                for item in results or []:
                    content = item.get("content", item.get("memory", ""))
                    score = float(item.get("score", 0))
                    if score < min_score or not content:
                        continue
                    parts.append(
                        f"(adbpg, score={score:.2f})\n{content}",
                    )
                if parts:
                    adb_text = "[ADBPG long-term memory]\n" + "\n\n".join(parts)
            except Exception as exc:  # noqa: BLE001
                logger.warning("ADBPG memory search failed: %s", exc)

        reme_resp = await super().memory_search(
            query=query,
            max_results=max_results,
            min_score=min_score,
        )
        reme_text = _memory_search_text(reme_resp)

        chunks: list[str] = []
        if adb_text:
            chunks.append(adb_text)
        if reme_text:
            chunks.append(reme_text)
        if not chunks:
            return ToolResponse(
                content=[
                    TextBlock(type="text", text="No relevant memories found."),
                ],
            )
        return ToolResponse(
            content=[TextBlock(type="text", text="\n\n---\n\n".join(chunks))],
        )

    # ------------------------------------------------------------------
    # Optional persistence after ReMe summarization
    # ------------------------------------------------------------------

    async def summary_memory(self, messages: list[Msg], **_kwargs) -> str:
        result = await super().summary_memory(messages, **_kwargs)
        if self._client is None or not messages:
            return result
        user_messages = self._filter_user_messages(messages)
        if user_messages:
            self._fire_and_forget_add(user_messages)
        return result

    @staticmethod
    def _filter_user_messages(messages: list[Msg]) -> list[dict]:
        return [
            {
                "role": "user",
                "content": (
                    msg.get_text_content()
                    if hasattr(msg, "get_text_content")
                    else str(msg.content)
                ),
            }
            for msg in messages
            if msg.role == "user"
        ]

    def _fire_and_forget_add(self, user_messages: list[dict]) -> None:
        client = self._client
        if client is None:
            return
        agent_id = self._effective_agent_id
        user_id = self._effective_user_id
        run_id = self._effective_run_id

        def _do_add() -> None:
            try:
                client.add_memory(
                    messages=user_messages,
                    user_id=user_id,
                    run_id=run_id,
                    agent_id=agent_id,
                )
            except Exception as exc:  # noqa: BLE001
                logger.error("ADBPG background add_memory failed: %s", exc)

        thread = threading.Thread(target=_do_add, daemon=True)
        thread.start()
