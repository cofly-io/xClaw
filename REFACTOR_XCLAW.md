# xClaw 重命名与结构调整说明

本文档汇总将原 **QwenPaw / qwenpaw**代码与资源统一为 **xClaw / xclaw** 的主要改动，便于审阅与后续发布。

## 1. 源码与打包元数据目录

| 原路径 | 新路径 |
|--------|--------|
| `src/qwenpaw/` | `src/xclaw/` |
| `src/qwenpaw.egg-info/`（若存在） | `src/xclaw.egg-info/` |

Python 包名由 `qwenpaw` 改为 **`xclaw`**，所有 `from qwenpaw...` / `import qwenpaw` 已替换为 `xclaw`。

**迁移完成状态（已完成）：**

`src/qwenpaw/` 目录在以下所有子资源全部迁移后已删除：

| qwenpaw 原路径 | xclaw 新路径 |
|---|---|
| `agents/mission/{handler,mission_runner,prompts,state,__init__}.py` | `src/xclaw/agents/mission/` |
| `agents/skills/chat_with_agent/SKILL.md` | `src/xclaw/agents/skills/chat_with_agent/SKILL.md` |
| `agents/skills/make_plan/SKILL.md` | `src/xclaw/agents/skills/make_plan/SKILL.md` |
| `agents/md_files/local/en/SOUL.md` | `src/xclaw/agents/md_files/local/en/SOUL.md` |
| `agents/md_files/local/zh/SOUL.md` | `src/xclaw/agents/md_files/local/zh/SOUL.md` |
| `agents/templates.py`（含 `LOCAL_AGENT_TEMPLATE`） | 合并入 `src/xclaw/agents/templates/__init__.py` |

`mission/prompts.py` 中 `xclaw agents chat --background` 等命令行引用已从 `qwenpaw` 更新为 `xclaw`。
SKILL.md 元数据中 `qwenpaw:` namespace key 已更新为 `xclaw:`。
`tests/unit/` 下所有残留 `from qwenpaw.*` 已替换为 `from xclaw.*`。

同步路径：`deploy/Dockerfile`、`.dockerignore`、`.gitignore` 中内置控制台目录已改为 **`src/xclaw/console/`**；镜像内初始化与进程命令使用 **`xclaw`** CLI。

## 2. `pyproject.toml`

- `[project].name`：`xclaw`
- `version` 动态属性：`xclaw.__version__.__version__`
- `[tool.setuptools.package-data]` 键：`"xclaw"`，注释中的控制台输出目录为 `src/xclaw/console/`
- `[project.optional-dependencies]` 中自引用 extras：`xclaw[local]` 等
- **控制台入口脚本**：
  - `xclaw` → `xclaw.cli.main:cli`
  - `xClaw` → 同上（兼容旧命令名）
  - `qwenpaw` → 同上（兼容旧命令名）

## 3. 批量文本替换（仓库内约 244 个文件）

对多种扩展名（含 `.py`、文档 `.md`、CI `.yml`、安装脚本、网站与 `website/public/docs` 等）执行了 **QwenPaw / Qwenpaw / qwenpaw** → **xClaw / xClaw / xclaw** 的替换，并修正导入与 `-m` 模块名为 `xclaw`。

**刻意保留或未改动的兼容项：**

- **内置 QA 智能体 ID** 字符串仍为 `"QwenPaw_QA_Agent_0.2"`（避免破坏已有工作区）。
- **环境变量前缀**仍以 `QWENPAW_*` 为主（含 `xClaw_*` 回退逻辑），与现有部署兼容。
- **遥测上报 URL** 仍为原 FC 域名（仅路径/服务侧是否更新由你们自行决定）；上报 JSON 中同时包含 `xclaw_version` 与 `qwenpaw_version`（同值），便于旧服务端解析。
- **技能元数据**：`metadata.xclaw` 为首选；仍识别 `metadata.qwenpaw` 与 `requires` 命名空间中的 `qwenpaw`（历史 SKILL.md）。
- **密钥环**：主服务名 `xclaw`，并依次尝试读取旧条目 `xClaw`、`qwenpaw`。

## 4. 运行时与数据目录默认值

- `constant.py` 中，在不存在 `~/.xClaw` legacy 目录时，**默认工作目录**由 `~/.qwenpaw` 调整为 **`~/.xclaw`**（仍可通过 `QWENPAW_WORKING_DIR` 覆盖）。
- `PROJECT_NAME` 为 **`xClaw`**。

## 5. 本地模型提供商 ID

- 内置本地提供商主 ID为 **`xclaw-local`**（显示名 xClaw Local）。
- `ProviderManager._normalize_provider_id` 将 **`xClaw-local`**、**`qwenpaw-local`** 规范为 **`xclaw-local`**。
- 启动时迁移：活动模型与 `builtin` 下的 `xClaw-local.json` / `qwenpaw-local.json` 会合并进 `xclaw-local` 存储并删除旧文件（逻辑见 `provider_manager.py`）。

## 6. 其他代码级重命名

- 主智能体类：**`xClawAgent`**（原 `QwenPawAgent`）。
- MCP / ReAct 客户端上的重建信息属性：**`_xclaw_rebuild_info`**。
- CLI 进程匹配：**`_matches_xclaw_cli_command`**、**`_is_xclaw_service_command`**、**`_is_xclaw_wrapper_process`**（仍识别命令行中的 `qwenpaw` / `qwenpaw.exe`）。
- 插件安装前检查：**`is_xclaw_running`**（原 `is_qwenpaw_running`）。
- 若干临时目录/文件前缀由 `qwenpaw_*` 改为 `xclaw_*`（上传、技能回滚、shell 输出等）。
- 遥测本地标记文件：写入 **`xclaw_version`**，读取时兼容旧字段 **`qwenpaw_version`**。

## 7. 前端 Console（`console/`）

- Ant Design / Chat 组件 **`prefix` / `prefixCls`**：`xclaw`；静态图标 **`xclaw-symbol.svg`**。
- 包名：`xclaw-console`。
- 模型页对内置本地提供商同时识别 **`xclaw-local` / `qwenpaw-local` / `xClaw-local`**（避免后端/API 仍返回旧 id 时 UI 异常）。

> 说明：此前已将上游 console 中 `xClaw`/`qwenpaw` 风格前缀统一为 `xclaw` 的改动，包含在本仓库的 console 目录现状中。

## 8. `src/xclaw.egg-info/` 手工同步项

若本地通过 `pip install -e .` 安装，egg-info 会由 setuptools 重新生成。当前仓库内已更新：

- `top_level.txt`：`xclaw`
- `entry_points.txt`：`xclaw` / `xClaw` / `qwenpaw` 三个控制台脚本指向同一入口
- `PKG-INFO` 的 `Name` / `Summary` 与项目名一致

建议在发布前于干净环境中执行：

```bash
pip install -e ".[dev]"
```

以刷新完整的 `PKG-INFO`、`SOURCES.txt` 等。

## 9. 建议的验证命令

```bash
set PYTHONPATH=src # Windows PowerShell: $env:PYTHONPATH="src"
python -c "import importlib; print(importlib.import_module('xclaw.__version__').__version__)"
xclaw --help
```

---

*文档生成对应仓库状态：将 Python 包与目录从 `qwenpaw` 迁移至 `xclaw`，并与 Console / 文档 / CI 脚本对齐。*
