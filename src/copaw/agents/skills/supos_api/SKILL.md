---
name: supos_api
description: "调用 supOS 工业互联网平台 Open API。涵盖用户认证、组织架构、工业元建模(UNS)、时序数据库、待办中心、事件、服务脚本、联邦查询、桌面管理、文件服务等所有平台能力。当用户询问任何与 supOS 平台数据、配置、管理相关的问题时使用此 skill。"
metadata:
  {
    "copaw": {
      "emoji": "🏭",
      "requires": {}
    }
  }
---
# supOS Open API

## 使用方法

**第一步：认证初始化（每次调用前执行）**

```python
import os, requests

AK = os.environ.get("SUPOS_AK", "")
if not AK:
    print("错误：未找到 SUPOS_AK，请联系管理员配置环境变量")
    exit()

cfg = requests.get("http://127.0.0.1:8088/api/supos/config", timeout=5).json()
SUPOS_URL = cfg.get("supos_url", "").rstrip("/")
if not SUPOS_URL:
    print("错误：未配置 supOS 平台地址，请在登录页面设置")
    exit()

HEADERS = {"Authorization": f"Bearer {AK}"}
# 调用示例：requests.get(f"{SUPOS_URL}/os/open-api/auth/v1/users", headers=HEADERS)
```

---

## 接口分类索引

根据用户需求，先确认所属分类，再用 `read_file` 工具读取对应文档获取详细接口说明。

| 分类 | 文档文件 | 覆盖能力 |
|------|----------|----------|
| 用户与认证 | `supOS_API_Docs/supOS_用户和认证_API文档.md` | 用户列表/详情/创建/更新/启停/锁定，basePath: `/os/open-api/auth/v1/` |
| 角色与菜单 | `supOS_API_Docs/supOS_角色管理_API文档.md` + `supOS_API_Docs/supOS_菜单配置_API文档.md` | 角色增删改查，菜单列表，basePath: `/os/open-api/rbac/v1/` |
| 企业组织架构 | `supOS_API_Docs/supOS_企业组织架构_API文档.md` | 公司/部门/人员/岗位增删改查，basePath: `/os/open-api/org/v1/` |
| 工业元建模(UNS) | `supOS_API_Docs/supOS_工业元建模_API文档.md` | 文件夹/文件/模板/实例/标签/数据的增删改查，basePath: `/os/open-api/uns/` |
| 时序数据库 | `supOS_API_Docs/supOS_时序数据库_API文档.md` | 实时值读写、历史数据聚合/采样/原始查询、设备管理，basePath: `/os/open-api/` |
| 待办中心 | `supOS_API_Docs/supOS_待办中心_API文档.md` | 待办流程和任务的创建/查询/更新，basePath: `/os/open-api/` |
| 事件开放 | `supOS_API_Docs/supOS_事件开放_API文档.md` | 事件主题查询、事件发布、事件订阅拉取与确认，basePath: `/os/open-api/event-center/v1` |
| 服务与订阅脚本 | `supOS_API_Docs/supOS_服务与订阅管理_API文档.md` | JS/SQL 服务和订阅脚本的增删改查与执行，basePath: `/os/open-api/` |
| 联邦查询 | `supOS_API_Docs/supOS_联邦查询_API文档.md` | 跨数据库 SQL 查询，Database/Schema/Table 元数据，basePath: `/os/open-api/fedquery/v1/` |
| 桌面管理 | `supOS_API_Docs/supOS_桌面管理服务_API文档.md` | 组件和公司动态的增删改查，basePath: `/os/open-api/desktop/v1/` |
| 文件服务 | `supOS_API_Docs/supOS_文件服务_API文档.md` | 文件上传/下载/删除/列表，basePath: `/os/open-api/file-server/v2/` |
| OAuth2 | `supOS_API_Docs/supOS_身份认证oauth2_API文档.md` | 授权码获取、令牌刷新，basePath: `/os/open-api/auth/v1/` |

---

## 操作流程

1. 理解用户意图，从上表确定所属分类
2. 用 `read_file` 读取对应文档，获取具体接口路径、参数、响应结构
3. 用认证初始化代码拼接完整 URL 发起请求
4. 返回结果给用户，必要时格式化展示

**注意**：文档路径相对于项目根目录，如 `supOS_API_Docs/supOS_用户和认证_API文档.md`
