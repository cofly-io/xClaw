---
name: supos_api
description: "调用 supOS 工业互联网平台 Open API。涵盖用户认证、组织架构、工业元建模(UNS/统一命名空间)、时序数据库实时值/历史数据、报警管理、待办中心、事件订阅、FaaS服务脚本、联邦查询、桌面管理、文件服务等全部平台能力。当用户询问任何与 supOS 平台的数据查询、设备数据、人员组织、权限角色、待办任务、**报警记录**、事件、脚本服务相关问题时使用此 skill。"
metadata:
  {
    "xclaw": {
      "emoji": "🏭",
      "requires": {}
    }
  }
---
# supOS Open API

## ⚠️ 重要规则

**禁止自行编写 Python 代码调用 API。**

当需要调用 supOS Open API 时，必须使用内置工具：
`supos_api_call`

该工具在进程内直接完成请求（不依赖系统 `python` 可执行文件），并通过环境变量 `SUPOS_AK` 完成认证；桌面 `exe` 环境下也可以正常工作。

**同样禁止使用 `execute_shell_command` 去运行 `python -c ...`/`scripts/client.py` 来访问 supOS。**
原因：输出容易被吞、异常难追踪、并且在打包 exe 环境下不可靠。

当用户要“查询 UNS/工业元建模树、报警、时序数据”等任何平台数据时：
- 先 `read_file` 打开对应 API 文档，确认路径与参数
- 再直接 `supos_api_call` 请求
- 最终把结果翻译成用户能理解的业务回答（必要时做分页、筛选与字段解释）

**UNS 写入专用规则（必须遵守）**

当用户要“给某个 UNS 路径插入/写入模拟数据（关系型/结构化记录也算）”时：
- **只允许**调用：`POST /os/open-api/realtime/v3/write`
- **禁止**为此去研究 FaaS/订阅脚本来“写数据”
- **禁止**先读完整 `supOS_工业元建模_API文档.md`；优先读 `supOS_UNS_快速手册.md`
- 用户未提供字段时：直接生成 4-8 个合理字段并写入（每字段一个点）

## 调用方式

调用内置工具 `supos_api_call`（参数由模型填写/调用）：

```text
method: get | post | put | delete
path:   /os/open-api/...
data:   对应请求的数据
        - get：查询参数（dict 或 JSON 字符串）
        - post/put：请求体（dict 或 JSON 字符串）
        - delete：可选查询参数（dict 或 JSON 字符串）
```

参数说明：
- `<method>`：get / post / put / delete
- `<path>`：文档中的完整 API 路径（含 basePath）
- `[data]`：JSON 字符串，仅 POST/PUT 使用；GET 的 query 参数直接拼在 path 里

## 常用示例（直接照抄改参数即可）

### 1) 查询 UNS 树（懒加载单层）

- **doc**：`src/xClaw/agents/skills/supos_api/docs/supOS_工业元建模_API文档.md`
- **path**：`/os/open-api/uns/v2/instance/condition/tree`

调用 `supos_api_call`：

```text
method: post
path: /os/open-api/uns/v2/instance/condition/tree
data: {"parentId":"0","pageNo":1,"pageSize":100,"keyword":"","searchType":1}
```

### 2) 查询报警原始记录

- **doc**：`src/xClaw/agents/skills/supos_api/docs/supOS_位号报警_API文档.md`
- **path**：`/os/open-api/alarm/history/v1/raw`

```text
method: post
path: /os/open-api/alarm/history/v1/raw
data: {"clientId":"xclaw","pageNum":1,"pageSize":50,"sortBy":"activeTime","sortOrder":"desc"}
```

---

## 接口分类索引

**操作步骤**：
1. 根据用户意图从下表确定分类
2. 用 `read_file` **只读取必要的小段内容**，获取接口路径和参数说明（避免整篇文档）
3. 用内置工具 `supos_api_call` 发起请求，**不要自己写 requests 代码**

| 分类 | 文档路径 | 覆盖能力 |
|------|----------|----------|
| 用户与认证 | `src/xClaw/agents/skills/supos_api/docs/supOS_用户和认证_API文档.md` | 用户列表/详情/创建/更新/启停/锁定，basePath: `/os/open-api/auth/v1/` |
| 角色与菜单 | `src/xClaw/agents/skills/supos_api/docs/supOS_角色管理_API文档.md` 和 `src/xClaw/agents/skills/supos_api/docs/supOS_菜单配置_API文档.md` | 角色增删改查，菜单列表，basePath: `/os/open-api/rbac/v1/` |
| 企业组织架构 | **优先** `src/xClaw/agents/skills/supos_api/docs/supOS_组织架构_快速手册.md`；需要再读 `src/xClaw/agents/skills/supos_api/docs/supOS_企业组织架构_API文档.md` | 公司/部门/人员/岗位等；快速手册用于定位路径与常用规则 |
| 工业元建模(UNS) | **优先** `src/xClaw/agents/skills/supos_api/docs/supOS_UNS_快速手册.md`；需要再读 `src/xClaw/agents/skills/supos_api/docs/supOS_工业元建模_API文档.md` | 树查询、写入规则与常用模板；长文档覆盖所有 UNS 接口 |
| 时序数据库 | `src/xClaw/agents/skills/supos_api/docs/supOS_时序数据库_API文档.md` | 实时值读写、历史聚合/采样/原始查询、设备管理，basePath: `/os/open-api/` |
| 报警管理 | `src/xClaw/agents/skills/supos_api/docs/supOS_位号报警_API文档.md` | 原始报警记录查询、报警统计分析，basePath: `/os/open-api/alarm/history/v1/` |
| 待办中心 | `src/xClaw/agents/skills/supos_api/docs/supOS_待办中心_API文档.md` | 待办流程和任务的创建/查询/更新，basePath: `/os/open-api/` |
| 事件开放 | `src/xClaw/agents/skills/supos_api/docs/supOS_事件开放_API文档.md` | 事件主题查询、事件发布、订阅拉取与确认，basePath: `/os/open-api/event-center/v1` |
| 服务与订阅脚本(FaaS) | **优先** `src/xClaw/agents/skills/supos_api/docs/supOS_FaaS_服务与订阅_快速手册.md`；需要再读 `src/xClaw/agents/skills/supos_api/docs/supOS_服务与订阅管理_API文档.md` | 命名空间/分组/订阅脚本等；快速手册用于定位路径与常用模板 |
| 联邦查询 | `src/xClaw/agents/skills/supos_api/docs/supOS_联邦查询_API文档.md` | 跨数据库 SQL 查询，Database/Schema/Table 元数据，basePath: `/os/open-api/fedquery/v1/` |
| 桌面管理 | `src/xClaw/agents/skills/supos_api/docs/supOS_桌面管理服务_API文档.md` | 组件和公司动态增删改查，basePath: `/os/open-api/desktop/v1/` |
| 文件服务 | `src/xClaw/agents/skills/supos_api/docs/supOS_文件服务_API文档.md` | 文件上传/下载/删除/列表，basePath: `/os/open-api/file-server/v2/` |
