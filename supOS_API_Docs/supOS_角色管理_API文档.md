# 角色管理

**版本**: 1.0.0  
**OpenAPI**: 3.0.1

---
# basePath：/os/open-api/rbac/v1/

## 角色管理

### GET /roles

**查询角色列表**

根据条件分页查询角色列表，支持多种查询条件组合

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| keyword | query | string | 否 | 关键字搜索（支持角色名称和编码模糊匹配） |
| names | query | array<string> | 否 | 角色名称列表（批量精准匹配查询） |
| codes | query | array<string> | 否 | 角色编码列表（批量精准匹配查询，每个编码仅支持字母、数字、下划线，长度1-64位） |
| creator | query | string | 否 | 创建者（精准匹配） |
| current | query | integer | 否 | 页码 |
| pageSize | query | integer | 否 | 每页条数 |

#### Responses

**200**: 查询成功

| 字段 | 类型 | 说明 |
|------|------|------|
| pagination | object | 分页信息 |
| pagination.total | integer | 总记录数 |
| pagination.current | integer | 当前页码 |
| pagination.pageSize | integer | 每页条数 |
| list | array<role> | 角色列表 |
| list[].modifyTime | string (date-time) | 修改时间 |
| list[].createTime | string (date-time) | 创建时间 |
| list[].modifier | string | 修改者 |
| list[].creator | string | 创建者 |
| list[].code | string | 角色编码（仅支持字母、数字、下划线，长度1-64位） |
| list[].name | string | 角色名称 |
| list[].systemInit | boolean | 是否系统初始化 |
| list[].description | string | 角色描述 |

**400**: 请求参数错误

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误代码 |
| message | string | 错误消息 |
| detailMsg | string | 错误详情信息 |
| timestamp | string (date-time) | 错误发生时间 |

**500**: 服务器内部错误

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误代码 |
| message | string | 错误消息 |
| detailMsg | string | 错误详情信息 |
| timestamp | string (date-time) | 错误发生时间 |

---

### POST /roles

**批量创建角色**

批量创建新的角色

#### Request Body

*无定义*

#### Responses

**200**: 批量创建成功


**400**: 请求参数错误

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误代码 |
| message | string | 错误消息 |
| detailMsg | string | 错误详情信息 |
| timestamp | string (date-time) | 错误发生时间 |

**500**: 服务器内部错误

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误代码 |
| message | string | 错误消息 |
| detailMsg | string | 错误详情信息 |
| timestamp | string (date-time) | 错误发生时间 |

---

### PUT /roles

**批量更新角色**

批量更新现有角色的信息，以角色编码（code）为唯一标识进行更新。
当角色编码不存在时，系统将返回错误信息。


#### Request Body

*无定义*

#### Responses

**200**: 批量更新成功


**400**: 请求参数错误

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误代码 |
| message | string | 错误消息 |
| detailMsg | string | 错误详情信息 |
| timestamp | string (date-time) | 错误发生时间 |

**500**: 服务器内部错误

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误代码 |
| message | string | 错误消息 |
| detailMsg | string | 错误详情信息 |
| timestamp | string (date-time) | 错误发生时间 |

---

### DELETE /roles

**批量删除角色**

根据角色编码列表批量删除角色。
如果角色编码不存在，系统将直接忽略该编码，不会报错。


#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| codes | query | string | 是 | 角色编码列表（批量删除，多个编码用逗号分隔，每个编码仅支持字母、数字、下划线，长度1-64位） |

#### Responses

**204**: 批量删除成功


**400**: 请求参数错误

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误代码 |
| message | string | 错误消息 |
| detailMsg | string | 错误详情信息 |
| timestamp | string (date-time) | 错误发生时间 |

**500**: 服务器内部错误

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误代码 |
| message | string | 错误消息 |
| detailMsg | string | 错误详情信息 |
| timestamp | string (date-time) | 错误发生时间 |

---

