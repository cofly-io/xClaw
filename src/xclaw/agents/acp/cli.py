# -*- coding: utf-8 -*-
"""Console entry: run xClaw as an ACP agent over stdio (for IDE / ACP clients)."""

from __future__ import annotations

import asyncio
import sys
from pathlib import Path


def main() -> None:
    """``python -m xclaw.agents.acp`` or the ``xclaw-acp`` setuptools script."""
    agent_id: str | None = None
    workspace_dir: Path | None = None
    argv = list(sys.argv[1:])
    if argv and not argv[0].startswith("-"):
        agent_id = argv.pop(0)
    if argv and not argv[0].startswith("-"):
        workspace_dir = Path(argv.pop(0)).expanduser()
    if argv:
        sys.stderr.write(
            "Usage: xclaw-acp [agent_id] [workspace_dir]\n"
            "  Both arguments are optional; defaults follow xClaw config.\n",
        )
        raise SystemExit(2)
    from .server import run_xclaw_acp_agent

    asyncio.run(
        run_xclaw_acp_agent(
            agent_id=agent_id,
            workspace_dir=workspace_dir,
        ),
    )


if __name__ == "__main__":
    main()
