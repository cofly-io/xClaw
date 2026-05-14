# -*- coding: utf-8 -*-
"""ReMeLight-backed memory manager for agents."""
import importlib.metadata
import json
import logging
import platform
import shutil
import uuid
from datetime import datetime, timedelta
from pathlib import Path
from typing import TYPE_CHECKING

from agentscope.agent import ReActAgent
from agentscope.message import Msg, TextBlock, ToolResultBlock, ToolUseBlock
from agentscope.tool import Toolkit, ToolResponse

from xclaw.agents.memory.base_memory_manager import (
    BaseMemoryManager,
    memory_registry,
)
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

_REME_STORE_VERSION = "v1"
_EXPECTED_REME_VERSION = "0.3.1.8"
# Maximum number of tokens from query splitting
MAX_QUERY_TOKENS = 50


def _detect_memory_manager_backend() -> str:
    """Detect the memory store backend from environment variables.

    Resolves ``MEMORY_STORE_BACKEND`` with the following priority:
    - ``local``: always used on Windows
    - ``chroma``: used when ``chromadb`` is importable (non-Windows)
    - falls back to ``local`` when ``chromadb`` is unavailable

    Returns:
        Backend name string: ``"local"``, ``"chroma"``, or any explicitly
        configured value.
    """
    backend_env = EnvVarLoader.get_str("MEMORY_STORE_BACKEND", "auto")
    if backend_env != "auto":
        return backend_env

    if platform.system() == "Windows":
        return "local"

    try:
        import chromadb  # noqa: F401 pylint: disable=unused-import

        return "chroma"
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
        return "local"


@memory_registry.register("remelight")
class ReMeLightMemoryManager(BaseMemoryManager):
    """Memory manager backed by ReMeLight.

    Delegates lifecycle, search, and compaction to a ``ReMeLight`` instance
    (``self._reme``).
    """

    def __init__(self, working_dir: str, agent_id: str):
        super().__init__(working_dir=working_dir, agent_id=agent_id)
        self._reme_version_ok: bool = self._check_reme_version()
        self._reme = None

        logger.info(
            f"ReMeLightMemoryManager init: "
            f"agent_id={agent_id}, working_dir={working_dir}",
        )

        memory_manager_backend = _detect_memory_manager_backend()

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
        reme_cfg = agent_config.running.reme_light_memory_config
        rebuild_on_start = reme_cfg.rebuild_memory_index_on_start

        store_name = "memory"
        effective_rebuild = self._resolve_rebuild_on_start(
            working_dir=working_dir,
            store_version=_REME_STORE_VERSION,
            rebuild_on_start=rebuild_on_start,
        )

        recursive_file_watcher = reme_cfg.recursive_file_watcher

        self._reme = ReMeLight(
            working_dir=working_dir,
            default_embedding_model_config=emb_config,
            default_file_store_config={
                "backend": memory_manager_backend,
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

    @staticmethod
    def _mask_key(key: str) -> str:
        """Mask an API key, showing only the first 5 characters."""
        return key[:5] + "*" * (len(key) - 5) if len(key) > 5 else key

    @staticmethod
    def _check_reme_version() -> bool:
        """Return ``False`` (and warn) when the installed reme-ai version
        does not match the expected version."""
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

    def get_embedding_config(self) -> dict:
        """Return embedding config: config > env var > default."""
        self._warn_if_version_mismatch()
        cfg = load_agent_config(
            self.agent_id,
        ).running.reme_light_memory_config.embedding_model_config
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

    @staticmethod
    def _resolve_rebuild_on_start(
        working_dir: str,
        store_version: str,
        rebuild_on_start: bool,
    ) -> bool:
        """Return effective ``rebuild_index_on_start`` value.

        Uses a sentinel file ``.reme_store_{store_version}`` to detect whether
        the current store version has been initialized. Forces a one-time
        rebuild when the sentinel is absent. Bump *_REME_STORE_VERSION* to
        trigger another one-time rebuild on next start.
        """
        sentinel_name = f".reme_store_{store_version}"
        sentinel_path = Path(working_dir) / sentinel_name

        if sentinel_path.exists():
            return rebuild_on_start

        logger.info(
            f"Sentinel '{sentinel_name}' not found, forcing rebuild.",
        )

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
            f"ReMeLightMemoryManager closed: agent_id={self.agent_id}, "
            f"result={result}",
        )
        return result

    def get_memory_prompt(self, language: str = "zh") -> str:
        """Return the memory guidance prompt for the system prompt."""
        prompts = {"zh": MEMORY_GUIDANCE_ZH, "en": MEMORY_GUIDANCE_EN}
        return prompts.get(language, MEMORY_GUIDANCE_EN)

    def list_memory_tools(self):
        """Return memory tool functions to register with the agent toolkit."""
        return [self.memory_search]

    @staticmethod
    def _is_cjk(char: str) -> bool:
        """Check if a character is CJK (Chinese/Japanese/Korean)."""
        cp = ord(char)
        return (
            (0x4E00 <= cp <= 0x9FFF)
            or (0x3400 <= cp <= 0x4DBF)  # CJK Unified Ideographs
            or (  # CJK Extension A
                0xF900 <= cp <= 0xFAFF
            )  # CJK Compatibility Ideographs
        )

    def tokenize_query(
        self,
        query: str,
        max_tokens: int = MAX_QUERY_TOKENS,
    ) -> list[str]:
        """Tokenize query: CJK chars as 1-gram, non-CJK split by whitespace.

        Args:
            query: The search query string (non-empty)
            max_tokens: Maximum number of tokens to return

        Returns:
            List of tokens, limited to max_tokens
        """
        tokens = []

        for word in query.split():
            if not word:
                continue

            # Fast path: pure non-CJK word, add directly
            if not any(self._is_cjk(c) for c in word):
                tokens.append(word)
                if len(tokens) >= max_tokens:
                    break
                continue

            # Mixed CJK/non-CJK: iterate chars within the word
            non_cjk_buffer = []
            for char in word:
                if self._is_cjk(char):
                    if non_cjk_buffer:
                        tokens.append("".join(non_cjk_buffer))
                        non_cjk_buffer = []
                    tokens.append(char)
                else:
                    non_cjk_buffer.append(char)

                if len(tokens) >= max_tokens:
                    break

            if non_cjk_buffer and len(tokens) < max_tokens:
                tokens.append("".join(non_cjk_buffer))

            if len(tokens) >= max_tokens:
                break

        return tokens[:max_tokens]

    async def memory_search(
        self,
        query: str,
        max_results: int = 5,
        min_score: float = 0.1,
    ) -> ToolResponse:
        """
        Search MEMORY.md and memory/*.md files semantically.

        Use this tool before answering questions about prior work,
        decisions, dates, people, preferences, or todos. Returns top
        relevant snippets with file paths and line numbers.

        Args:
            query (`str`):
                The semantic search query to find relevant memory snippets.
            max_results (`int`, optional):
                Maximum number of search results to return. Defaults to 5.
            min_score (`float`, optional):
                Minimum similarity score for results. Defaults to 0.1.

        Returns:
            `ToolResponse`:
                Search results formatted with paths, line numbers, and
                content.
        """
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

        try:
            query_final = " ".join(self.tokenize_query(query))
            logger.info(f"Tokenized query: {query_final}")
        except Exception as e:
            logger.exception(f"Failed to tokenize query: {e} query={query}")
            query_final = query

        return await self._reme.memory_search(
            query=query_final,
            max_results=max_results,
            min_score=min_score,
        )

    async def summarize(self, messages: list[Msg], **_kwargs) -> str:
        """Generate a summary of the given messages and persist to memory."""
        agent_config = load_agent_config(self.agent_id)
        light_ctx = agent_config.running.light_context_config
        cc = light_ctx.context_compact_config
        chat_model, formatter = create_model_and_formatter(self.agent_id)

        set_current_workspace_dir(Path(self.working_dir))
        pruning_cfg = light_ctx.tool_result_pruning_config
        recent_max_bytes = pruning_cfg.pruning_recent_msg_max_bytes
        set_current_recent_max_bytes(recent_max_bytes)

        return await self._reme.summary_memory(
            messages=messages,
            as_llm=chat_model,
            as_llm_formatter=formatter,
            as_token_counter=get_token_counter(agent_config),
            toolkit=self.summary_toolkit,
            language=agent_config.language,
            max_input_length=agent_config.running.max_input_length,
            compact_ratio=cc.compact_threshold_ratio,
            timezone=load_config().user_timezone or None,
            add_thinking_block=cc.compact_with_thinking_block,
        )

    async def retrieve(
        self,
        messages: list[Msg] | Msg,
        agent_name: str = "",
        **_kwargs,
    ) -> dict | None:
        """Retrieve relevant memory and return updated kwargs dict.

        Args:
            messages: One or more conversation messages used as the query.
            agent_name: Agent name for constructing Msg.

        Returns:
            None: No relevant memory found, caller should not update kwargs.
            dict: {"msg": msgs + [assistant_msg, tool_result_msg]} to merge
                with kwargs via {**kwargs, **result}.
        """
        msgs: list[Msg] = (
            [messages] if isinstance(messages, Msg) else list(messages)
        )

        # Build query from the newest messages, preserving tail.
        query_parts: list[str] = []
        total = 0
        for msg in reversed(msgs):
            remaining = 100 - total
            if remaining <= 0:
                break

            text = (msg.get_text_content() or "").strip()
            if not text:
                continue

            chunk = text[:remaining]
            query_parts.insert(0, chunk)
            total += len(chunk)

        query = " ".join(query_parts).strip()
        if not query:
            return None

        agent_config = load_agent_config(self.agent_id)
        reme_cfg = agent_config.running.reme_light_memory_config
        ms = reme_cfg.auto_memory_search_config
        max_results = ms.max_results
        min_score = ms.min_score

        try:
            result = await self.memory_search(
                query=query,
                max_results=max_results,
                min_score=min_score,
            )
            content_blocks = result.content

            text_content = "\n".join(
                b.get("text", "")
                for b in content_blocks
                if isinstance(b, dict) and b.get("text")
            )
            if not text_content:
                return None

            # Construct assistant_msg and tool_result_msg
            _id = uuid.uuid4().hex
            tool_use_input = {
                "query": query,
                "max_results": max_results,
                "min_score": min_score,
            }

            assistant_msg = Msg(
                name=agent_name,
                role="assistant",
                content=[
                    TextBlock(
                        type="text",
                        text="Searching memory for relevant context...",
                    ),
                    ToolUseBlock(
                        type="tool_use",
                        id=_id,
                        name="memory_search",
                        input=tool_use_input,
                        raw_input=json.dumps(
                            tool_use_input,
                            ensure_ascii=False,
                        ),
                    ),
                ],
            )

            tool_result_msg = Msg(
                name=agent_name,
                role="system",
                content=[
                    ToolResultBlock(
                        type="tool_result",
                        id=_id,
                        name="memory_search",
                        output=[TextBlock(type="text", text=text_content)],
                    ),
                ],
            )

            return {"msg": msgs + [assistant_msg, tool_result_msg]}

        except Exception as e:
            logger.exception(f"memory_search failed: {e}")
            return None

    async def auto_memory_search(
        self,
        messages: list[Msg] | Msg,
        agent_name: str = "",
        **kwargs,
    ) -> dict | None:
        """Auto-search memory if auto_memory_search_config.enabled is True."""
        agent_config = load_agent_config(self.agent_id)
        rlmc = agent_config.running.reme_light_memory_config
        ms = rlmc.auto_memory_search_config

        if not ms.enabled:
            return None

        return await self.retrieve(messages, agent_name=agent_name)

    async def summarize_when_compact(
        self,
        messages: list[Msg],
        **kwargs,
    ) -> None:
        """Schedule summarize task if summarize_when_compact is enabled."""
        if not messages:
            return

        agent_config = load_agent_config(self.agent_id)
        rlmc = agent_config.running.reme_light_memory_config

        if rlmc.summarize_when_compact:
            self.add_summarize_task(messages=messages)

    async def auto_memory(
        self,
        all_messages: list[Msg],
        **kwargs,
    ) -> None:
        """Auto-extract memory every N user queries."""
        agent_config = load_agent_config(self.agent_id)
        rlmc = agent_config.running.reme_light_memory_config
        auto_memory_interval = rlmc.auto_memory_interval

        if auto_memory_interval is None or auto_memory_interval <= 0:
            return

        user_message_count = sum(
            1 for msg in all_messages if msg.role == "user"
        )

        if (
            user_message_count >= auto_memory_interval
            and user_message_count % auto_memory_interval == 0
        ):
            # Find the start of the recent interval window
            user_count = 0
            start_idx = 0
            for i, msg in enumerate(all_messages):
                if msg.role == "user":
                    user_count += 1
                    if (
                        user_count
                        == user_message_count - auto_memory_interval + 1
                    ):
                        start_idx = i
                        break
            recent_messages = all_messages[start_idx:]
            if recent_messages:
                self.add_summarize_task(messages=recent_messages)

    async def dream(self, **kwargs) -> None:
        """Run one dream-based memory optimization pass."""
        logger.info("running dream-based memory optimization")

        agent_config = load_agent_config(self.agent_id)
        light_ctx = agent_config.running.light_context_config
        chat_model, formatter = create_model_and_formatter(self.agent_id)

        set_current_workspace_dir(Path(self.working_dir))
        pruning_cfg = light_ctx.tool_result_pruning_config
        recent_max_bytes = pruning_cfg.pruning_recent_msg_max_bytes
        set_current_recent_max_bytes(recent_max_bytes)

        language = getattr(agent_config, "language", "zh")
        current_date = datetime.now().strftime("%Y-%m-%d")

        prompts = {"zh": DREAM_OPTIMIZATION_ZH, "en": DREAM_OPTIMIZATION_EN}
        template = prompts.get(language, DREAM_OPTIMIZATION_EN)
        query_text = template.format(current_date=current_date)

        if not query_text.strip():
            logger.debug("dream optimization skipped: empty query")
            return

        backup_path = Path(self.working_dir).absolute() / "backup"
        backup_path.mkdir(parents=True, exist_ok=True)

        memory_file = Path(self.working_dir) / "MEMORY.md"
        if memory_file.exists():
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_filename = f"memory_backup_{timestamp}.md"
            backup_file = backup_path / backup_filename
            try:
                shutil.copyfile(memory_file, backup_file)
                logger.info(f"Created MEMORY.md backup: {backup_file}")
            except Exception as e:
                logger.error(f"Failed to create MEMORY.md backup: {e}")
        else:
            logger.debug("No existing MEMORY.md file to backup")

        dream_agent = ReActAgent(
            name="DreamOptimizer",
            model=chat_model,
            sys_prompt="You are a Dream Memory Organizer specialized"
            " in optimizing long-term memory files.",
            toolkit=self.summary_toolkit,
            formatter=formatter,
        )
        dream_agent.set_console_output_enabled(False)

        user_msg = Msg(
            name="dream",
            role="user",
            content=[TextBlock(type="text", text=query_text)],
        )

        try:
            response = await dream_agent.reply(user_msg)
            logger.info(f"Dream agent response: {response.get_text_content()}")
        except Exception as e:
            logger.exception(f"dream-based memory optimization failed: {e}")
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
