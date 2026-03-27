---
name: supos_api
description: "调用 supOS 工业互联网平台 Open API。涵盖用户认证、组织架构、工业元建模(UNS/统一命名空间)、时序数据库实时值/历史数据、待办中心、事件订阅、FaaS服务脚本、联邦查询、桌面管理、文件服务等全部平台能力。当用户询问任何与 supOS 平台的数据查询、设备数据、人员组织、权限角色、待办任务、事件、脚本服务相关问题时使用此 skill。"
metadata:
  {
    "copaw": {
      "emoji": "🏭",
      "requires": {}
    }
  }
---
# supOS Open API

## 认证初始化

每次调用前执行，优先使用已登录的 ticket，否则使用 AK：

```python
import os, requests, json

# 优先用已登录 ticket
_token_info = {}
try:
    _token_info = requests.get("http://127.0.0.1:8088/api/supos/token", timeout=3).json()
except Exception:
    pass

if _token_info.get("ticket"):
    # 用户已通过登录页面登录
    SUPOS_URL = _token_info["supos_url"].rstrip("/")
    HEADERS = {"Authorization": f"Bearer {_token_info['ticket']}"}
else:
    # 使用内置 AK（适合自动化场景）
    AK = os.environ.get("SUPOS_AK", "")
    if not AK:
        print("错误：未找到 SUPOS_AK 且未登录，请在登录页面登录或联系管理员")
        exit()
    cfg = requests.get("http://127.0.0.1:8088/api/supos/config", timeout=3).json()
    SUPOS_URL = cfg.get("supos_url", "").rstrip("/")
    if not SUPOS_URL:
        print("错误：未配置 supOS 平台地址，请在登录页面设置")
        exit()
    HEADERS = {"Authorization": f"Bearer {AK}"}
```

---

## 接口分类索引

**操作步骤**：
1. 根据用户意图从下表确定分类
2. 用 `read_file` 读取对应文档（路径相对于工作区根目录）
3. 按文档中的接口说明拼接 `{SUPOS_URL}{path}` 发起请求

| 分类 | 文档路径 | 覆盖能力 |
|------|----------|----------|
| 用户与认证 | `src/copaw/agents/skills/supos_api/docs/supOS_用户和认证_API文档.md` | 用户列表/详情/创建/更新/启停/锁定，basePath: `/os/open-api/auth/v1/` |
| 角色与菜单 | `src/copaw/agents/skills/supos_api/docs/supOS_角色管理_API文档.md` 和 `src/copaw/agents/skills/supos_api/docs/supOS_菜单配置_API文档.md` | 角色增删改查，菜单列表，basePath: `/os/open-api/rbac/v1/` |
| 企业组织架构 | `src/copaw/agents/skills/supos_api/docs/supOS_企业组织架构_API文档.md` | 公司/部门/人员/岗位增删改查，basePath: `/os/open-api/org/v1/` |
| 工业元建模(UNS) | `src/copaw/agents/skills/supos_api/docs/supOS_工业元建模_API文档.md` | 文件夹/文件/模板/树查询/属性查询，basePath: `/os/open-api/uns/` |
| 时序数据库 | `src/copaw/agents/skills/supos_api/docs/supOS_时序数据库_API文档.md` | 实时值读写、历史聚合/采样/原始查询、设备管理，basePath: `/os/open-api/` |
| 待办中心 | `src/copaw/agents/skills/supos_api/docs/supOS_待办中心_API文档.md` | 待办流程和任务的创建/查询/更新，basePath: `/os/open-api/` |
| 事件开放 | `src/copaw/agents/skills/supos_api/docs/supOS_事件开放_API文档.md` | 事件主题查询、事件发布、订阅拉取与确认，basePath: `/os/open-api/event-center/v1` |
| 服务与订阅脚本(FaaS) | `src/copaw/agents/skills/supos_api/docs/supOS_服务与订阅管理_API文档.md` | JS/SQL 服务和订阅脚本增删改查与执行，basePath: `/os/open-api/` |
| 联邦查询 | `src/copaw/agents/skills/supos_api/docs/supOS_联邦查询_API文档.md` | 跨数据库 SQL 查询，Database/Schema/Table 元数据，basePath: `/os/open-api/fedquery/v1/` |
| 桌面管理 | `src/copaw/agents/skills/supos_api/docs/supOS_桌面管理服务_API文档.md` | 组件和公司动态增删改查，basePath: `/os/open-api/desktop/v1/` |
| 文件服务 | `src/copaw/agents/skills/supos_api/docs/supOS_文件服务_API文档.md` | 文件上传/下载/删除/列表，basePath: `/os/open-api/file-server/v2/` |
| OAuth2 | `src/copaw/agents/skills/supos_api/docs/supOS_身份认证oauth2_API文档.md` | 授权码获取、令牌刷新，basePath: `/os/open-api/auth/v1/` |

---

## 通用错误处理

```python
if r.status_code == 401:
    print("认证失败：ticket 或 AK 无效，请重新登录或检查 SUPOS_AK")
elif r.status_code == 400:
    err = r.json()
    print(f"参数错误 {err.get('code', '')}: {err.get('message', r.text[:200])}")
elif r.status_code == 502:
    print("无法连接 supOS 平台，请检查平台地址和网络")
elif r.status_code not in (200, 204):
    print(f"请求失败 {r.status_code}: {r.text[:300]}")
```
