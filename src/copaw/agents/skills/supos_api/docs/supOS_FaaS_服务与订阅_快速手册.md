# supOS FaaS 服务与订阅（给模型用）

目标：处理“服务脚本/订阅脚本/命名空间/分组”等需求时，优先只读本文件，
避免整篇 `supOS_服务与订阅管理_API文档.md` 导致 token 浪费与命中不准。

## basePath

`/os/open-api/`

## 使用规则

- 只用内置工具 `supos_api_call` 调用 Open API。
- 先用本手册定位接口；不足再精读长文档对应小节。

## 高频对象与路径速查

### 1) 命名空间 namespaces

- **创建命名空间**：POST `/faas/v1/namespaces`
- **查询命名空间**：GET `/faas/v1/namespaces`
- **查询单个命名空间**：GET `/faas/v1/namespaces/{name}`
- **更新命名空间**：PUT `/faas/v1/namespaces/{name}`
- **删除命名空间**：DELETE `/faas/v1/namespaces/{name}`

示例（创建）：

```text
method: post
path: /os/open-api/faas/v1/namespaces
data: {"name":"customer_ns","showName":"Customer NS","source":"customer"}
```

### 2) 分组 groups

- POST `/faas/v1/groups`
- GET `/faas/v1/groups`
- PUT `/faas/v1/groups`
- DELETE `/faas/v1/groups`

（具体字段以长文档对应小节为准；这里用于快速定位路径。）

### 3) 订阅脚本 subscriptions（JavaScript）

常用一组路径（namespace + name）：
- **创建订阅**：POST `/faas/v1/scripts/subscriptions/javascript`
- **获取订阅**：GET `/faas/v1/scripts/subscriptions/javascript/{namespace}/{name}`
- **更新订阅**：PUT `/faas/v1/scripts/subscriptions/javascript/{namespace}/{name}`
- **删除订阅**：DELETE `/faas/v1/scripts/subscriptions/javascript/{namespace}/{name}`

示例（获取某个订阅）：

```text
method: get
path: /os/open-api/faas/v1/scripts/subscriptions/javascript/{namespace}/{name}
data: null
```

> 注意：创建/更新订阅涉及字段较多（触发器、脚本内容、groupPath、subject 等），
> 需要时再精读长文档里对应接口小节，复制 Request Body 模板后再调用 `supos_api_call`。

## 长文档（按需精读）

`src/copaw/agents/skills/supos_api/docs/supOS_服务与订阅管理_API文档.md`

