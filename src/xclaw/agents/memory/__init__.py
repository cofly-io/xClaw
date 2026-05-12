# -*- coding: utf-8 -*-
"""Memory management module for xClaw agents."""

from .agent_md_manager import AgentMdManager
from .base_memory_manager import BaseMemoryManager
from .reme_light_memory_manager import ReMeLightMemoryManager
from .adbpg_memory_manager import ADBPGMemoryManager  # noqa: F401 — registers "adbpg"

__all__ = [
    "AgentMdManager",
    "BaseMemoryManager",
    "ReMeLightMemoryManager",
    "ADBPGMemoryManager",
]
