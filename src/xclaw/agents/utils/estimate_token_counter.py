# -*- coding: utf-8 -*-
"""Estimated token counter (byte-length heuristic) for xClaw agents."""

from __future__ import annotations

from typing import Any

from agentscope.token import TokenCounterBase


def _estimate_bytes(text: str, divisor: float) -> int:
    if not text:
        return 0
    return int(len(text.encode("utf-8")) / divisor + 0.5)


class EstimatedTokenCounter(TokenCounterBase):
    """Approximate token counts using UTF-8 length / ``estimate_divisor``.

    Matches the QwenPaw / CoPaw pattern: callers may pass ``text=...`` in
    ``kwargs`` (see ``memory_compaction``) while satisfying
    :class:`agentscope.token.TokenCounterBase`.
    """

    def __init__(self, estimate_divisor: float = 4.0) -> None:
        if estimate_divisor <= 0:
            raise ValueError("estimate_divisor must be positive")
        self.estimate_divisor = float(estimate_divisor)

    async def count(
        self,
        messages: list[dict] | None = None,
        **kwargs: Any,
    ) -> int:
        msgs = messages if messages is not None else []
        text = kwargs.get("text")
        if isinstance(text, str) and text:
            return _estimate_bytes(text, self.estimate_divisor)
        total = 0
        for msg in msgs:
            if not isinstance(msg, dict):
                continue
            content = msg.get("content", "")
            if isinstance(content, str):
                total += _estimate_bytes(content, self.estimate_divisor)
        return total
