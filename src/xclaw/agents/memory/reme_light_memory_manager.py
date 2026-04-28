# -*- coding: utf-8 -*-
# pylint: disable=too-many-branches
# mypy: ignore-errors
"""ReMeLight-backed memory manager for agents."""
import importlib.metadata
import json
import logging
import os
import platform
import shutil
import uuid
from datetime import datetime, timedelta
from pathlib import Path
from typing import TYPE_CHECKING

from agentscope.agent import ReActAgent
from agentscope.message import Msg, TextBlock
from agentscope.tool import Toolkit, ToolResponse

from xclaw.agents.memory.base_memory_manager import BaseMemoryManager
from xclaw.agents.model_factory import create_model_and_formatter
from xclaw.agents.tools import read_file, write_file, edit_file
from xclaw.agents.utils import get_token_counter
from xclaw.config import load_config
from xclaw.config.config import load_agent_config
from xclaw.config.context import (
    set_current_workspace_dir,
    set_current_recent_max_bytes,
)
from xclaw.constant import EnvVarLoader

if TYPE_CHECKING:
    from reme.memory.file_based.reme_in_memory_memory import ReMeInMemoryMemory

logger = logging.getLogger(__name__)

_EXPECTED_REME_VERSION = "0.3.1.8"
_REME_STORE_VERSION = "v1"


class ReMeLightMemoryManager(BaseMemoryManager):
    """Memory manager that wraps ReMeLight for agents via composition.

    Holds a ``ReMeLight`` instance (``self._reme``) and delegates all
    lifecycle / search / compaction calls to it.

    Capabilities:
    - Conversation compaction via compact_memory()
    - Memory summarization with file tools via summary_memory()
    - Vector and full-text search via memory_search()
    """

    def __init__(self, working_dir: str, agent_id: str):
        """Initialize with ReMeLight.

        Args:
            working_dir: Working directory for memory storage.
            agent_id: Agent ID for config loading.

        Embedding priority: config > env var (EMBEDDING_API_KEY /
        EMBEDDING_BASE_URL / EMBEDDING_MODEL_NAME).
        Backend: MEMORY_STORE_BACKEND env var (auto/local/chroma,
        default auto).
        """
        super().__init__(working_dir=working_dir, agent_id=agent_id)
        self._reme_version_ok: bool = self._check_reme_version()
        self._reme = None

        logger.info(
            f"ReMeLightMemoryManager init: "
            f"agent_id={agent_id}, working_dir={working_dir}",
        )

        backend_env = EnvVarLoader.get_str("MEMORY_STORE_BACKEND", "auto")
        if backend_env == "auto":
            if platform.system() == "Windows":
                memory_backend = "local"
            else:
                try:
                    import chromadb  # noqa: F401 pylint: disable=unused-import

                    memory_backend = "chroma"
                except Exception as e:
                    logger.warning(
                        f"""
chromadb import failed, falling back to `local` backend.
This is often caused by an outdated system SQLite (requires >= 3.35).
Please upgrade your system SQLite to >= 3.35.
See: https://docs.trychroma.com/docs/overview/troubleshooting#sqlite
| Error: {e}
                        """,
                    )
                    memory_backend = "local"
        else:
            memory_backend = backend_env

        from reme.reme_light import ReMeLight

        emb_config = self.get_embedding_config()
        vector_enabled = bool(emb_config["base_url"]) and bool(
            emb_config["model_name"],
        )

        log_cfg = {
            **emb_config,
            "api_key": self._mask_key(emb_config["api_key"]),
        }
        logger.info(
            f"Embedding config: {log_cfg}, vector_enabled={vector_enabled}",
        )

        fts_enabled = EnvVarLoader.get_bool("FTS_ENABLED", True)

        agent_config = load_agent_config(self.agent_id)
        rebuild_on_start = (
            agent_config.running.memory_summary.rebuild_memory_index_on_start
        )

        store_name = "memory"
        effective_rebuild = self._resolve_rebuild_on_start(
            working_dir=working_dir,
            store_version=_REME_STORE_VERSION,
            rebuild_on_start=rebuild_on_start,
        )

        recursive_file_watcher = (
            agent_config.running.memory_summary.recursive_file_watcher
        )

        self._reme = ReMeLight(
            working_dir=working_dir,
            default_embedding_model_config=emb_config,
            default_file_store_config={
                "backend": memory_backend,
                "store_name": store_name,
                "vector_enabled": vector_enabled,
                "fts_enabled": fts_enabled,
            },
            default_file_watcher_config={
                "rebuild_index_on_start": effective_rebuild,
                "recursive": recursive_file_watcher,
            },
        )

        self.summary_toolkit = Toolkit()
        self.summary_toolkit.register_tool_function(read_file)
        self.summary_toolkit.register_tool_function(write_file)
        self.summary_toolkit.register_tool_function(edit_file)

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _mask_key(key: str) -> str:
        """Mask API key, showing first 5 chars only."""
        return key[:5] + "*" * (len(key) - 5) if len(key) > 5 else key

    @staticmethod
    def _resolve_rebuild_on_start(
        working_dir: str,
        store_version: str,
        rebuild_on_start: bool,
    ) -> bool:
        """Return effective rebuild_index_on_start value.

        Uses a sentinel file ``.reme_store_{store_version}`` to track whether
        the current store version has already been initialized.  If the
        sentinel is absent a one-time rebuild is forced and the sentinel is
        created.  On subsequent starts the sentinel exists and the
        caller-supplied *rebuild_on_start* is used as-is.

        To trigger a future one-time rebuild, bump *_REME_STORE_VERSION*.
        """
        sentinel_name = f".reme_store_{store_version}"
        sentinel_path = Path(working_dir) / sentinel_name

        if sentinel_path.exists():
            return rebuild_on_start

        logger.info(
            f"Sentinel '{sentinel_name}' not found, forcing rebuild.",
        )

        # Remove stale sentinels left by previous versions.
        try:
            for old in Path(working_dir).glob(".reme_store_*"):
                old.unlink(missing_ok=True)
        except Exception as e:
            logger.warning(f"Failed to remove old sentinels: {e}")

        try:
            sentinel_path.touch()
        except Exception as e:
            logger.warning(f"Failed to create sentinel '{sentinel_name}': {e}")

        return True

    @staticmethod
    def _check_reme_version() -> bool:
        """Return False (and warn) when installed reme-ai version
        mismatches."""
        try:
            installed = importlib.metadata.version("reme-ai")
        except importlib.metadata.PackageNotFoundError:
            return True
        if installed != _EXPECTED_REME_VERSION:
            logger.warning(
                f"reme-ai version mismatch: installed={installed}, "
                f"expected={_EXPECTED_REME_VERSION}. "
                f"Run `pip install reme-ai=={_EXPECTED_REME_VERSION}`"
                " to align.",
            )
            return False
        return True

    def _warn_if_version_mismatch(self) -> None:
        """Warn once per call if the cached version check failed."""
        if not self._reme_version_ok:
            logger.warning(
                "reme-ai version mismatch, "
                f"expected={_EXPECTED_REME_VERSION}. "
                f"Run `pip install reme-ai=={_EXPECTED_REME_VERSION}`"
                " to align.",
            )

    def _prepare_model_formatter(self) -> None:
        """Lazily initialize chat_model and formatter if not already set."""
        self._warn_if_version_mismatch()
        if self.chat_model is None or self.formatter is None:
            self.chat_model, self.formatter = create_model_and_formatter(
                self.agent_id,
            )

    # ------------------------------------------------------------------
    # Public helpers
    # ------------------------------------------------------------------

    def get_embedding_config(self) -> dict:
        """Return embedding config with priority:
        config > env var > default."""
        self._warn_if_version_mismatch()
        cfg = load_agent_config(self.agent_id).running.embedding_config
        return {
            "backend": cfg.backend,
            "api_key": cfg.api_key
            or EnvVarLoader.get_str("EMBEDDING_API_KEY"),
            "base_url": cfg.base_url
            or EnvVarLoader.get_str("EMBEDDING_BASE_URL"),
            "model_name": cfg.model_name
            or EnvVarLoader.get_str("EMBEDDING_MODEL_NAME"),
            "dimensions": cfg.dimensions,
            "enable_cache": cfg.enable_cache,
            "use_dimensions": cfg.use_dimensions,
            "max_cache_size": cfg.max_cache_size,
            "max_input_length": cfg.max_input_length,
            "max_batch_size": cfg.max_batch_size,
        }

    async def restart_embedding_model(self):
        """Restart the embedding model with current config."""
        self._warn_if_version_mismatch()
        if self._reme is None:
            return
        await self._reme.restart(
            restart_config={
                "embedding_models": {"default": self.get_embedding_config()},
            },
        )

    # ------------------------------------------------------------------
    # BaseMemoryManager interface
    # ------------------------------------------------------------------

    async def start(self):
        """Start the ReMeLight lifecycle."""
        self._warn_if_version_mismatch()
        if self._reme is None:
            return None
        return await self._reme.start()

    async def close(self) -> bool:
        """Close ReMeLight and perform cleanup."""
        self._warn_if_version_mismatch()
        logger.info(
            f"ReMeLightMemoryManager closing: agent_id={self.agent_id}",
        )
        if self._reme is None:
            return True
        result = await self._reme.close()
        logger.info(
            f"ReMeLightMemoryManager closed: "
            f"agent_id={self.agent_id}, result={result}",
        )
        return result

    async def compact_tool_result(self, **kwargs):
        """Compact tool results by truncating large outputs."""
        self._warn_if_version_mismatch()
        if self._reme is None:
            return None
        return await self._reme.compact_tool_result(**kwargs)

    async def check_context(self, **kwargs):
        """Check context size and determine if compaction is needed."""
        self._warn_if_version_mismatch()
        if self._reme is None:
            return None
        return await self._reme.check_context(**kwargs)

    async def compact_memory(
        self,
        messages: list[Msg],
        previous_summary: str = "",
        extra_instruction: str = "",
        **_kwargs,
    ) -> str:
        """Compact messages into a condensed summary.

        Returns the compacted string, or empty string on failure.
        """
        self._prepare_model_formatter()

        agent_config = load_agent_config(self.agent_id)
        cc = agent_config.running.context_compact

        if extra_instruction:
            result = await self._reme.compact_memory(
                messages=messages,
                as_llm=self.chat_model,
                as_llm_formatter=self.formatter,
                as_token_counter=get_token_counter(agent_config),
                language=agent_config.language,
                max_input_length=agent_config.running.max_input_length,
                compact_ratio=cc.memory_compact_ratio,
                previous_summary=previous_summary,
                return_dict=True,
                add_thinking_block=cc.compact_with_thinking_block,
                extra_instruction=extra_instruction,
            )
        else:
            # Compatible with older versions of ReMe
            result = await self._reme.compact_memory(
                messages=messages,
                as_llm=self.chat_model,
                as_llm_formatter=self.formatter,
                as_token_counter=get_token_counter(agent_config),
                language=agent_config.language,
                max_input_length=agent_config.running.max_input_length,
                compact_ratio=cc.memory_compact_ratio,
                previous_summary=previous_summary,
                return_dict=True,
                add_thinking_block=cc.compact_with_thinking_block,
            )

        if isinstance(result, str):
            logger.error(
                "compact_memory returned str instead of dict, "
                f"result: {result[:200]}... "
                "Please install the latest reme package.",
            )
            return result

        if not result.get("is_valid", True):
            unique_id = uuid.uuid4().hex[:8]
            filepath = os.path.join(
                agent_config.workspace_dir,
                f"compact_invalid_{unique_id}.json",
            )
            try:
                with open(filepath, "w", encoding="utf-8") as f:
                    json.dump(result, f, ensure_ascii=False, indent=2)
                logger.error(
                    f"Invalid compact result saved to {filepath}. "
                    f"user_msg: {result.get('user_message', '')[:200]}..., "
                    "history_compact: "
                    f"{result.get('history_compact', '')[:200]}...",
                )
                logger.error(
                    "Please upload the log to github issues",
                )
            except Exception as _e:
                logger.error(f"Failed to save invalid compact result: {_e}")
            return ""

        return result.get("history_compact", "")

    async def summary_memory(self, messages: list[Msg], **_kwargs) -> str:
        """Generate a comprehensive summary of the given messages."""
        self._prepare_model_formatter()

        agent_config = load_agent_config(self.agent_id)
        cc = agent_config.running.context_compact

        set_current_workspace_dir(Path(self.working_dir))
        recent_max_bytes = (
            agent_config.running.tool_result_compact.recent_max_bytes
        )
        set_current_recent_max_bytes(recent_max_bytes)

        return await self._reme.summary_memory(
            messages=messages,
            as_llm=self.chat_model,
            as_llm_formatter=self.formatter,
            as_token_counter=get_token_counter(agent_config),
            toolkit=self.summary_toolkit,
            language=agent_config.language,
            max_input_length=agent_config.running.max_input_length,
            compact_ratio=cc.memory_compact_ratio,
            timezone=load_config().user_timezone or None,
            add_thinking_block=cc.compact_with_thinking_block,
        )

    async def memory_search(
        self,
        query: str,
        max_results: int = 5,
        min_score: float = 0.1,
    ) -> ToolResponse:
        """Search stored memories for relevant content."""
        self._warn_if_version_mismatch()
        if self._reme is None or not getattr(self._reme, "_started", False):
            return ToolResponse(
                content=[
                    TextBlock(
                        type="text",
                        text="ReMe is not started, report github issue!",
                    ),
                ],
            )
        return await self._reme.memory_search(
            query=query,
            max_results=max_results,
            min_score=min_score,
        )

    def get_in_memory_memory(self, **_kwargs) -> "ReMeInMemoryMemory | None":
        """Retrieve the in-memory memory object with token counting support."""
        self._warn_if_version_mismatch()
        if self._reme is None:
            return None
        agent_config = load_agent_config(self.agent_id)
        return self._reme.get_in_memory_memory(
            as_token_counter=get_token_counter(agent_config),
        )

    # ------------------------------------------------------------------
    # Dream-based memory optimization
    # ------------------------------------------------------------------

    async def dream_memory(self, **kwargs) -> None:
        """
        Run one dream-based memory optimization: execute dream task as
        agent query.
        """
        logger.info("running dream-based memory optimization")

        self._prepare_model_formatter()

        # Load agent config to get model configuration
        agent_config = load_agent_config(self.agent_id)

        set_current_workspace_dir(Path(self.working_dir))
        recent_max_bytes = (
            agent_config.running.tool_result_compact.recent_max_bytes
        )
        set_current_recent_max_bytes(recent_max_bytes)

        # Determine language based on agent config
        language = getattr(agent_config, "language", "zh")

        # Get current date in YYYY-MM-DD format
        current_date = datetime.now().strftime("%Y-%m-%d")

        # Build the dream prompt with working directory and current date=
        query_text = self._get_dream_prompt(
            language,
            current_date,
        )

        if not query_text.strip():
            logger.debug("dream optimization skipped: empty query")
            return

        # Ensure model and formatter are prepared
        self._prepare_model_formatter()

        # Create backup directory to store backup files
        self.backup_path = Path(self.working_dir).absolute() / "backup"
        self.backup_path.mkdir(parents=True, exist_ok=True)

        # Handle MEMORY.md backup directly in code before agent processing
        memory_file = Path(self.working_dir) / "MEMORY.md"
        if memory_file.exists():
            # Create timestamp for backup filename
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_filename = f"memory_backup_{timestamp}.md"
            backup_file = self.backup_path / backup_filename

            # Read current MEMORY.md content and write to backup
            try:
                shutil.copyfile(memory_file, backup_file)
                logger.info(f"Created MEMORY.md backup: {backup_file}")
            except Exception as e:
                logger.error(f"Failed to create MEMORY.md backup: {e}")
                # Continue anyway, but log the error
        else:
            logger.debug("No existing MEMORY.md file to backup")

        # Create a minimal ReActAgent for dream functionality
        dream_agent = ReActAgent(
            name="DreamOptimizer",
            model=self.chat_model,
            sys_prompt="You are a Dream Memory Organizer specialized"
            " in optimizing long-term memory files.",
            toolkit=self.summary_toolkit,
            formatter=self.formatter,
        )

        # Build request message
        user_msg = Msg(
            name="dream",
            role="user",
            content=[TextBlock(type="text", text=query_text)],
        )

        try:
            response = await dream_agent.reply(user_msg)
            logger.debug(
                f"Dream agent response: {response.get_text_content()}",
            )
        except Exception as e:
            logger.error("dream-based memory optimization failed: %s", repr(e))
            raise

    # ------------------------------------------------------------------
    # Experience distillation
    # ------------------------------------------------------------------

    async def distill_experience(self, **kwargs) -> None:
        """
        Run experience distillation: analyze recent sessions and extract
        user patterns, preferences, and successful experiences into PROFILE.md.

        This creates a "hot knowledge" layer that is always loaded into the
        system prompt, enabling personalized responses.
        """
        logger.info("Running experience distillation")

        self._prepare_model_formatter()

        agent_config = load_agent_config(self.agent_id)
        memory_summary = agent_config.running.memory_summary

        if not memory_summary.distill_enabled:
            logger.info("Experience distillation is disabled, skipping")
            return

        set_current_workspace_dir(Path(self.working_dir))
        recent_max_bytes = (
            agent_config.running.tool_result_compact.recent_max_bytes
        )
        set_current_recent_max_bytes(recent_max_bytes)

        language = getattr(agent_config, "language", "zh")
        current_date = datetime.now().strftime("%Y-%m-%d")
        lookback_days = memory_summary.distill_lookback_days
        max_experiences = memory_summary.distill_max_experiences

        # Collect recent memory files for context
        recent_memory_files = self._get_recent_memory_files(lookback_days)

        # Build the distillation prompt
        query_text = self._get_distill_prompt(
            language=language,
            current_date=current_date,
            lookback_days=lookback_days,
            max_experiences=max_experiences,
            recent_memory_files=recent_memory_files,
        )

        if not query_text.strip():
            logger.debug("Distillation skipped: empty query")
            return

        # Ensure backup directory exists
        backup_path = Path(self.working_dir).absolute() / "backup"
        backup_path.mkdir(parents=True, exist_ok=True)

        # Backup existing PROFILE.md if it exists
        profile_file = Path(self.working_dir) / "PROFILE.md"
        if profile_file.exists():
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_filename = f"profile_backup_{timestamp}.md"
            backup_file = backup_path / backup_filename
            try:
                shutil.copyfile(profile_file, backup_file)
                logger.info(f"Created PROFILE.md backup: {backup_file}")
            except Exception as e:
                logger.error(f"Failed to create PROFILE.md backup: {e}")
        else:
            logger.debug("No existing PROFILE.md file to backup")

        # Create a ReActAgent for distillation
        distill_agent = ReActAgent(
            name="ExperienceDistiller",
            model=self.chat_model,
            sys_prompt=(
                "You are an Experience Distiller specialized in extracting "
                "user patterns, preferences, and successful work experiences "
                "from conversation history. Your goal is to create a concise "
                "user profile that helps future interactions be more personalized "
                "and effective."
            ),
            toolkit=self.summary_toolkit,
            formatter=self.formatter,
        )

        user_msg = Msg(
            name="distill",
            role="user",
            content=[TextBlock(type="text", text=query_text)],
        )

        try:
            response = await distill_agent.reply(user_msg)
            logger.info(
                f"Distillation completed: {response.get_text_content()[:200]}...",
            )
        except Exception as e:
            logger.error("Experience distillation failed: %s", repr(e))
            raise

    def _get_recent_memory_files(self, lookback_days: int) -> list[str]:
        """Get list of recent memory/*.md files within lookback period."""
        memory_dir = Path(self.working_dir) / "memory"
        if not memory_dir.exists():
            return []

        recent_files = []
        today = datetime.now()

        for i in range(lookback_days):
            date = today - timedelta(days=i)
            date_str = date.strftime("%Y-%m-%d")
            memory_file = memory_dir / f"{date_str}.md"
            if memory_file.exists():
                recent_files.append(f"memory/{date_str}.md")

        return recent_files

    def _get_distill_prompt(
        self,
        language: str = "zh",
        current_date: str = "",
        lookback_days: int = 7,
        max_experiences: int = 5,
        recent_memory_files: list[str] = None,
    ) -> str:
        """Get the distillation prompt based on language."""
        recent_files_str = ", ".join(recent_memory_files or [])

        prompts = {
            "zh": (
                f"# 用户经验蒸馏任务\n\n"
                f"当前日期: {current_date}\n"
                f"回溯天数: {lookback_days} 天\n"
                f"最大经验条目: {max_experiences}\n\n"
                "## 任务目标\n"
                "从近期的对话记忆中提取用户的：\n"
                "1. **身份背景**：行业、角色、专长领域\n"
                "2. **工具偏好**：常用工具、编程语言、框架选择\n"
                "3. **成功经验**：已验证有效的工作模式和方法\n"
                "4. **沟通偏好**：回复风格、详细程度等\n\n"
                "## 执行步骤\n\n"
                "### 步骤 1 [读取记忆]\n"
                f"使用 `read` 工具读取以下文件：\n"
                f"- `MEMORY.md`（长期记忆）\n"
                f"- `PROFILE.md`（现有画像，如果存在）\n"
                + (f"- 近期日志: {recent_files_str}\n" if recent_files_str else "")
                + "\n"
                "### 步骤 2 [分析提炼]\n"
                "仔细分析记忆内容，识别：\n"
                "- 反复出现的工作模式\n"
                "- 明确表达的偏好（如「我喜欢...」「不要...」）\n"
                "- 成功的工具使用案例（记录具体方法和原因）\n"
                "- 用户的专业背景线索\n\n"
                "### 步骤 3 [生成画像]\n"
                "生成结构化的用户画像，格式如下：\n\n"
                "```markdown\n"
                "# 用户画像\n\n"
                "## 身份背景\n"
                "- 行业：[行业]\n"
                "- 角色：[角色]\n"
                "- 专长：[专长列表]\n\n"
                "## 核心偏好\n"
                "- 代码风格：[偏好]\n"
                "- 回复风格：[偏好]\n"
                "- 工具偏好：[偏好]\n\n"
                f"## Top {max_experiences} 成功经验\n"
                "1. [经验描述] [置信度: XX%]\n"
                "2. ...\n\n"
                "---\n"
                "*更新时间: {current_date} | 蒸馏自近 {lookback_days} 天记忆*\n"
                "```\n\n"
                "### 步骤 4 [写入文件]\n"
                "使用 `write` 工具将生成的画像写入 `PROFILE.md`。\n\n"
                "### 步骤 5 [汇报结果]\n"
                "简要汇报：\n"
                "1. 识别到的关键用户特征\n"
                "2. 新增或更新的成功经验\n"
                "3. 画像的主要变化\n\n"
                "## 注意事项\n"
                "- 如果信息不足，保留「待确认」标记\n"
                "- 经验需要有具体的方法描述，不要泛泛而谈\n"
                "- 置信度基于该经验被验证的次数估算\n"
                "- 保持画像精简，控制在 500 tokens 以内\n"
            ),
            "en": (
                f"# User Experience Distillation Task\n\n"
                f"Current date: {current_date}\n"
                f"Lookback period: {lookback_days} days\n"
                f"Max experience entries: {max_experiences}\n\n"
                "## Objective\n"
                "Extract from recent conversation memories:\n"
                "1. **Identity**: Industry, role, expertise areas\n"
                "2. **Tool preferences**: Commonly used tools, languages, frameworks\n"
                "3. **Successful experiences**: Verified effective patterns and methods\n"
                "4. **Communication preferences**: Response style, detail level, etc.\n\n"
                "## Execution Steps\n\n"
                "### Step 1 [Read Memory]\n"
                f"Use `read` tool to read:\n"
                f"- `MEMORY.md` (long-term memory)\n"
                f"- `PROFILE.md` (existing profile, if exists)\n"
                + (f"- Recent logs: {recent_files_str}\n" if recent_files_str else "")
                + "\n"
                "### Step 2 [Analyze & Extract]\n"
                "Carefully analyze memory content to identify:\n"
                "- Recurring work patterns\n"
                "- Explicit preferences (e.g., 'I prefer...', 'Don't...')\n"
                "- Successful tool usage cases (record specific methods and reasons)\n"
                "- User's professional background clues\n\n"
                "### Step 3 [Generate Profile]\n"
                "Generate a structured user profile in this format:\n\n"
                "```markdown\n"
                "# User Profile\n\n"
                "## Identity\n"
                "- Industry: [industry]\n"
                "- Role: [role]\n"
                "- Expertise: [list]\n\n"
                "## Core Preferences\n"
                "- Code style: [preference]\n"
                "- Response style: [preference]\n"
                "- Tool preference: [preference]\n\n"
                f"## Top {max_experiences} Successful Experiences\n"
                "1. [Experience description] [Confidence: XX%]\n"
                "2. ...\n\n"
                "---\n"
                "*Updated: {current_date} | Distilled from {lookback_days} days*\n"
                "```\n\n"
                "### Step 4 [Write File]\n"
                "Use `write` tool to save the profile to `PROFILE.md`.\n\n"
                "### Step 5 [Report Results]\n"
                "Briefly report:\n"
                "1. Key user characteristics identified\n"
                "2. New or updated successful experiences\n"
                "3. Major changes to the profile\n\n"
                "## Notes\n"
                "- If information is insufficient, keep 'TBD' markers\n"
                "- Experiences need specific method descriptions, not generalities\n"
                "- Confidence is estimated based on verification frequency\n"
                "- Keep profile concise, under 500 tokens\n"
            ),
        }
        return prompts.get(language, prompts["en"])

    def _get_dream_prompt(
        self,
        language: str = "zh",
        current_date: str = "",
    ) -> str:
        """Get the dream prompt based on language."""
        prompts = {
            "zh": (
                "现在进入梦境状态，对长期记忆进行优化整理。请读取今日日志与现有长期记忆，"
                "在梦境中提炼高价值增量信息并去重合并，最终覆写至 `MEMORY.md`，"
                "确保长期记忆文件保持最新、精简、无冗余。\n\n"
                f"当前日期: {current_date}\n\n"
                "【梦境优化原则】\n"
                "1. 极简去冗：严禁记录流水账、Bug修复细节或单次任务。"
                "仅保留“核心业务决策”、“确认的用户偏好”与“高价值可复用经验”。\n"
                "2. 状态覆写：若发现状态变更（如技术栈更改、配置更新），"
                "必须用新状态替换旧状态，严禁新旧矛盾信息并存。\n"
                "3. 归纳整合：主动将零碎的相似规则提炼、合并为通用性强的独立条目。"
                "\n4. 废弃剔除：主动删除已被证伪的假设或不再适用的陈旧条目。\n\n"
                "【梦境执行步骤】\n步骤 1 [加载]：调用 `read` 工具，"
                "读取根目录下的 `MEMORY.md` 以及当天的日志文件 `memory/YYYY-MM-DD.md`。\n"
                "步骤 2 [梦境提纯]：在梦境中对比新旧内容，严格按照【梦境优化原则】进行去重、替换、剔除和合并，"
                "生成一份全新的记忆内容。\n步骤 3 [落盘]：调用 `write` 或 `edit` 工具，"
                "将整理后全新的 Markdown 内容覆盖写入到 `MEMORY.md` 中（请保持清晰的层级与列表结构）。\n"
                "步骤 4 [苏醒汇报]：从梦境中苏醒后，在对话中向我简短汇报：1) 新增/沉淀了哪些核心记忆；"
                "2) 修正/删除了哪些过期内容。"
            ),
            "en": (
                "Enter dream state for memory optimization. Please act as a "
                "'Dream Memory Organizer', read today's logs and existing "
                "long-term memory, extract high-value incremental information "
                "in your dream state, deduplicate and merge, and ultimately "
                "overwrite `MEMORY.md`. Ensure the long-term memory file "
                "remains up-to-date, concise, and non-redundant.\n\n"
                f"Current date: {current_date}\n\n"
                "[Dream Optimization Principles]\n1. Extreme "
                "Minimalism: Strictly forbid recording daily routines, "
                "specific bug-fix details, or one-off tasks. Retain ONLY 'core"
                " business decisions', 'confirmed user preferences', and "
                "'high-value reusable experiences'.\n2. State Overwrite: If a"
                " state change is detected (e.g., tech stack changes, config "
                "updates), you MUST replace the old state with the new one. "
                "Contradictory old and new information must not coexist.\n3. "
                "Inductive Consolidation: Proactively distill and merge "
                "fragmented, similar rules into highly universal, independent"
                " entries.\n4. Deprecation: Proactively delete hypotheses "
                "that have been proven false or outdated entries that no "
                "longer apply.\n\n[Dream Execution Steps]\nStep 1 [Load]: "
                "Invoke the `read` tool to read `MEMORY.md` in the root "
                "directory and today's log file `memory/YYYY-MM-DD.md`.\n"
                "Step 2 [Dream Purification]: Compare the old and new content "
                "in your dream state. Strictly follow the [Dream Optimization "
                "Principles] to deduplicate, replace, remove, and merge, "
                "generating entirely new memory content.\nStep 3 [Save]: "
                "Invoke the `write` or `edit` tool to overwrite the newly "
                "organized Markdown content into `MEMORY.md` (maintain clear "
                "hierarchy and list structures).\nStep 4 [Awake Report]: "
                "After waking from your dream, briefly report to me in the "
                "chat: 1) What core memories were newly added/consolidated; "
                "2) What outdated content was corrected/deleted."
            ),
        }
        return prompts.get(language, prompts["en"])
