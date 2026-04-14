# -*- coding: utf-8 -*-
"""Runtime paths for frozen (PyInstaller) desktop builds.

Portable Node is expected next to the executable::

    dist/xClaw/node/node.exe

Override for local testing::

    set XCLAW_BUNDLED_NODE=C:\\path\\to\\folder\\containing\\node.exe
"""
from __future__ import annotations

import os
import sys
from pathlib import Path


def get_desktop_exe_dir() -> Path:
    """Directory containing the app executable (xClaw.exe when frozen)."""
    return Path(sys.executable).resolve().parent


def bundled_node_bin_dir() -> Path | None:
    """Folder that contains ``node.exe`` (Windows), or None if not bundled."""
    if sys.platform != "win32":
        return None

    override = (os.environ.get("XCLAW_BUNDLED_NODE") or "").strip()
    if override:
        p = Path(override)
        if (p / "node.exe").is_file():
            return p.resolve()

    if not getattr(sys, "frozen", False):
        return None

    d = get_desktop_exe_dir() / "node"
    if (d / "node.exe").is_file():
        return d
    return None


def prepend_bundled_node_to_os_path() -> None:
    """Put bundled ``node.exe`` first on ``PATH`` (whole process)."""
    bn = bundled_node_bin_dir()
    if bn is None:
        return
    s = str(bn)
    p = os.environ.get("PATH", "")
    if p == s or p.startswith(s + os.pathsep):
        return
    os.environ["PATH"] = s + os.pathsep + p
