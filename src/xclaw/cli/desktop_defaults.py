# -*- coding: utf-8 -*-
"""First-run defaults for packaged desktop (macOS / Windows)."""
from __future__ import annotations

import json
from pathlib import Path

from ..agents.skill_system import SkillPoolService, SkillService
from ..agents.skill_system.registry import set_builtin_skill_language_preference
from ..config.utils import load_config, save_config
from ..constant import WORKING_DIR, EnvVarLoader

DESKTOP_UI_LANGUAGE = "zh"
DESKTOP_AGENT_LANGUAGE = "zh"
DESKTOP_REQUIRED_SKILLS = ("supos_api",)
DESKTOP_REQUIRED_TOOLS = ("supos_api_call",)


def is_desktop_packaged_app() -> bool:
    return EnvVarLoader.get_bool("QWENPAW_DESKTOP_APP")


def _write_ui_settings(language: str = DESKTOP_UI_LANGUAGE) -> None:
    settings_path = Path(WORKING_DIR).expanduser() / "settings.json"
    payload: dict = {}
    if settings_path.is_file():
        try:
            payload = json.loads(settings_path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            payload = {}
    payload["language"] = language
    payload["builtin_skill_language"] = language
    settings_path.parent.mkdir(parents=True, exist_ok=True)
    settings_path.write_text(
        json.dumps(payload, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    set_builtin_skill_language_preference(language)


def _ensure_config_language_and_tools() -> None:
    config = load_config()
    config.agents.language = DESKTOP_AGENT_LANGUAGE
    for tool_name in DESKTOP_REQUIRED_TOOLS:
        tool = config.tools.builtin_tools.get(tool_name)
        if tool is not None:
            tool.enabled = True
    save_config(config)


def _ensure_skills_enabled(workspace: Path) -> list[str]:
    pool = SkillPoolService()
    service = SkillService(workspace)
    enabled: list[str] = []
    for skill_name in DESKTOP_REQUIRED_SKILLS:
        pool.download_to_workspace(skill_name, workspace, overwrite=False)
        result = service.enable_skill(skill_name)
        if result.get("success"):
            enabled.append(skill_name)
    return enabled


def apply_desktop_pack_defaults(default_workspace: Path) -> None:
    """Apply zh UI/agent defaults and ensure supOS skill + tool on first init."""
    _write_ui_settings()
    _ensure_config_language_and_tools()
    enabled = _ensure_skills_enabled(default_workspace)
    if enabled:
        print(f"✓ Desktop defaults: UI/agent language zh; skills enabled: {', '.join(enabled)}")
    else:
        print(
            "⚠ Desktop defaults: language set to zh; "
            f"could not enable skills: {', '.join(DESKTOP_REQUIRED_SKILLS)}",
        )
    missing_tools = [
        name
        for name in DESKTOP_REQUIRED_TOOLS
        if name not in load_config().tools.builtin_tools
    ]
    if missing_tools:
        print(f"⚠ Desktop defaults: missing builtin tools: {', '.join(missing_tools)}")
