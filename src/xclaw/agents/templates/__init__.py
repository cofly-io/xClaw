# -*- coding: utf-8 -*-
"""Builtin agent profile templates (default assistant, local, QA helper, …)."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import List, Optional

from ...constant import BUILTIN_QA_AGENT_SKILL_NAMES
from ...config.config import (
    AgentProfileConfig,
    ChannelConfig,
    HeartbeatConfig,
    MCPConfig,
    ToolsConfig,
    build_local_agent_tools_config,
    build_qa_agent_tools_config,
)

DEFAULT_AGENT_TEMPLATE = "default"
LOCAL_AGENT_TEMPLATE = "local"
QA_AGENT_TEMPLATE = "qa"

# Skills pre-installed for the local-model agent template
LOCAL_TEMPLATE_SKILL_NAMES = ("make_plan",)

QA_TEMPLATE_DESCRIPTION = (
    "Builtin Q&A helper for xClaw setup, local config under "
    "QWENPAW_WORKING_DIR, and documentation. Prefer reading files "
    "before answering; use absolute paths for code outside this "
    "workspace."
)


@dataclass(frozen=True)
class AgentTemplateBuildResult:
    """Output of :func:`build_agent_template`."""

    agent_config: AgentProfileConfig
    initial_skill_names: List[str]
    md_template_id: Optional[str]


def list_supported_agent_templates() -> List[str]:
    """IDs accepted by ``xclaw agents create --template``."""
    return [DEFAULT_AGENT_TEMPLATE, LOCAL_AGENT_TEMPLATE, QA_AGENT_TEMPLATE]


def get_workspace_md_template_id(
    template_ref: Optional[str],
) -> Optional[str]:
    """Map stored ``template_id`` to a directory under ``agents/md_files/``."""
    if not template_ref:
        return None
    key = str(template_ref).strip().lower()
    if key in {LOCAL_AGENT_TEMPLATE, QA_AGENT_TEMPLATE}:
        return key
    return None


def build_agent_template(
    template_key: str,
    *,
    agent_id: str,
    workspace_dir: Path,
    fallback_language: str = "zh",
    name: str,
    description: str = "",
    language: Optional[str] = None,
) -> AgentTemplateBuildResult:
    """Build a new :class:`AgentProfileConfig` from a builtin template key."""
    key = (template_key or DEFAULT_AGENT_TEMPLATE).strip().lower()
    if key not in (DEFAULT_AGENT_TEMPLATE, LOCAL_AGENT_TEMPLATE, QA_AGENT_TEMPLATE):
        raise ValueError(f"Unknown agent template: {template_key!r}")

    lang = (language or fallback_language or "zh").strip() or "zh"
    ws = str(Path(workspace_dir).expanduser())

    if key == LOCAL_AGENT_TEMPLATE:
        return AgentTemplateBuildResult(
            agent_config=AgentProfileConfig(
                id=agent_id,
                name=name or "Local Agent",
                description=description or "An agent running on local deployed models.",
                workspace_dir=ws,
                template_id=LOCAL_AGENT_TEMPLATE,
                language=lang,
                channels=ChannelConfig(),
                mcp=MCPConfig(),
                heartbeat=HeartbeatConfig(),
                tools=build_local_agent_tools_config(),
            ),
            initial_skill_names=list(LOCAL_TEMPLATE_SKILL_NAMES),
            md_template_id=LOCAL_AGENT_TEMPLATE,
        )

    if key == QA_AGENT_TEMPLATE:
        skills = list(BUILTIN_QA_AGENT_SKILL_NAMES)
        return AgentTemplateBuildResult(
            agent_config=AgentProfileConfig(
                id=agent_id,
                name=name,
                description=description,
                workspace_dir=ws,
                template_id=QA_AGENT_TEMPLATE,
                language=lang,
                channels=ChannelConfig(),
                mcp=MCPConfig(),
                heartbeat=HeartbeatConfig(),
                tools=build_qa_agent_tools_config(),
            ),
            initial_skill_names=skills,
            md_template_id=QA_AGENT_TEMPLATE,
        )

    return AgentTemplateBuildResult(
        agent_config=AgentProfileConfig(
            id=agent_id,
            name=name,
            description=description,
            workspace_dir=ws,
            template_id=DEFAULT_AGENT_TEMPLATE,
            language=lang,
            channels=ChannelConfig(),
            mcp=MCPConfig(),
            heartbeat=HeartbeatConfig(),
            tools=ToolsConfig(),
        ),
        initial_skill_names=[],
        md_template_id=None,
    )
