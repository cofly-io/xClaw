# 桌面管理服务

**版本**: 1.0.0  
**OpenAPI**: 3.0.3

---
# basePath：/os/open-api/desktop/v1/


## 组件管理

### GET /components

**组件列表**

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| current | query | integer | 否 | 当前页码 |
| pageSize | query | integer | 否 | 页面大小,最大1000 |

#### Responses

**200**: OK

| 字段 | 类型 | 说明 |
|------|------|------|
| pagination | Pagination |  |
| pagination.total | integer (int64) | 总数据量 |
| pagination.pageSize | integer (int64) | 每页数量 |
| pagination.current | integer (int64) | 当前页码 |
| list | array<ComponentItem> |  |
| list[].id | integer (int64) | 组件ID |
| list[].code | string | 组件编码 |
| list[].displayName | string | 组件名称 |
| list[].iconPath | string | 组件图标 |
| list[].resourceUrl | string | 组件资源地址 |
| list[].compSize | string | 组件大小：宽,高 |
| list[].url | string | 组件URL |
| list[].icon | string | 组件图标 |
| list[].enablePublic | boolean | 权限：受控-false，公开-true |
| list[].enableUse | boolean | 是否启用 |

---

### POST /components

**组件新增**

#### Request Body

| 字段 | 类型 | 说明 |
|------|------|------|
| code | string | 组件编码 |
| displayName | string | 组件名称 |
| iconPath | string | 组件图标 |
| resourceUrl | string | 组件资源地址 |
| compSize | string | 组件大小：宽,高 |
| description | string | 组件图标 |
| enablePublic | boolean | 权限：受控-false，公开-true |
| enableUse | boolean | 是否启用 |
#### Responses

**200**: OK

| 字段 | 类型 | 说明 |
|------|------|------|
| data | ComponentId |  |
| data.id | integer (int64) | 组件id |

**400**: 错误提示
* 100112005 组件编码已存在


| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer | 错误编码
 |
| message | string | 错误提示 |

---

### PUT /components/{code}

**组件更新**

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| code | path | string | 是 | 组件编码 |

#### Request Body

| 字段 | 类型 | 说明 |
|------|------|------|
| displayName | string | 组件名称 |
| iconPath | string | 组件图标 |
| resourceUrl | string | 组件资源地址 |
| compSize | string | 组件大小：宽,高 |
| description | string | 组件图标 |
| enablePublic | boolean | 权限：受控-false，公开-true |
| enableUse | boolean | 是否启用 |
#### Responses

**200**: OK


**400**: 错误提示
* 100112004 组件不存在


| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer | 错误编码
 |
| message | string | 错误提示 |

---

### DELETE /components/{code}

**组件删除**

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| code | path | string | 是 | 组件编码 |

#### Responses

**200**: OK


**400**: 错误提示
* 100112004 组件不存在


| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer | 错误编码
 |
| message | string | 错误提示 |

---


## 公司动态组件管理

### GET /companyNews

**公司动态列表**

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| current | query | integer | 否 | 当前页码 |
| pageSize | query | integer | 否 | 页面大小,最大1000 |

#### Responses

**200**: OK

| 字段 | 类型 | 说明 |
|------|------|------|
| pagination | Pagination |  |
| pagination.total | integer (int64) | 总数据量 |
| pagination.pageSize | integer (int64) | 每页数量 |
| pagination.current | integer (int64) | 当前页码 |
| list | array<CompanyMessageItem> |  |
| list[].id | integer (int64) | 消息ID |
| list[].title | string | 标题 |
| list[].resourceUrl | string | 资源地址 |
| list[].createTime | string (date-time) | 创建时间 |

---

### POST /companyNews

**公司动态新增**

#### Request Body

| 字段 | 类型 | 说明 |
|------|------|------|
| title | string | 标题 |
| resourceUrl | string | 资源地址 |
#### Responses

**200**: OK

| 字段 | 类型 | 说明 |
|------|------|------|
| data | CompanyMessageId |  |
| data.id | integer (int64) | 消息id |

**400**: 错误提示
* 100112006 公司动态标题长度需小于200个字符
* 100112007 公司动态链接长度需小于1000个字符


| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer | 错误编码
 |
| message | string | 错误提示 |

---

### PUT /companyNews/{id}

**公司动态更新**

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| id | path | integer | 是 | 消息ID |

#### Request Body

| 字段 | 类型 | 说明 |
|------|------|------|
| title | string | 标题 |
| resourceUrl | string | 资源地址 |
#### Responses

**200**: OK


**400**: 错误提示
* 100112006 公司动态标题长度需小于200个字符
* 100112007 公司动态链接长度需小于1000个字符
* 100112009 公司动态不存在


| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer | 错误编码
 |
| message | string | 错误提示 |

---

### DELETE /companyNews/{id}

**公司动态删除**

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| id | path | integer | 是 | 消息ID |

#### Responses

**200**: OK


**400**: 错误提示
* 100112009 公司动态不存在


| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer | 错误编码
 |
| message | string | 错误提示 |

---

