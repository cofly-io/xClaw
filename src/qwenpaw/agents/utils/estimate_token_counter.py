# -*- coding: utf-8 -*-
"""Lightweight async token counter interface for context handlers."""

from __future__ import annotations

from abc import ABC, abstractmethod


class EstimatedTokenCounter(ABC):
    """Pluggable tokenizer used by ``AsMsgHandler`` / context managers."""

    @abstractmethod
    async def count(
        self,
        text: str = "",
        messages: list | None = None,
    ) -> int:
        """Return estimated token count for *text* or *messages*."""
