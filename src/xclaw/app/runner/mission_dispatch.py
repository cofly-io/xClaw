# -*- coding: utf-8 -*-
"""Mission-mode routing (phased PRD / execution loops).

The full mission workflow is optional; stubs return "no active mission" so
standard agent queries proceed unchanged.
"""

from __future__ import annotations

from typing import Any, Dict, Optional


def detect_active_mission_phase(
    workspace: Any,
    *,
    session_id: str,
) -> Optional[Dict[str, Any]]:
    """Return mission state for *session_id* if a mission loop is active."""
    _ = (workspace, session_id)


async def maybe_handle_mission_command(
    *,
    query: str | None,
    msgs: Any,
    workspace_dir: Any,
    agent_id: str,
    rewrite_fn: Any,
    session_id: str | None,
    agent_name: str = "Friday",
) -> Any:
    """Handle `/mission` control path when mission module is enabled.

    Default stub: no-op (return ``None``). Replace with real implementation
    when `agents.mission` is wired in.
    """
    _ = (query, msgs, workspace_dir, agent_id, rewrite_fn, session_id, agent_name)
