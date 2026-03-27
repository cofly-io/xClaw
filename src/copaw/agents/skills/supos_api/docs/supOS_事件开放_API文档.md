# 事件开放

**版本**: 1.0.0  
**OpenAPI**: 3.0.1

---
# basePath：/os/open-api/event-center/v1


## 事件主题

### GET /topics

**分页获取事件主题列表**

事件主题列表，支持分页查询

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| current | query | integer | 否 | 当前页码 |
| pageSize | query | integer | 否 | 每页大小 |

#### Responses

**200**: 获取事件列表成功

| 字段 | 类型 | 说明 |
|------|------|------|
| list | array<Topic> | 数据列表 |
| list[].topic | string | topic |
| list[].topicDisplayName | string | 主题显示名称 |
| list[].subjects | array<SubjectInfo> | 主题组列表 |
| list[].subjects[].subject | string | 组名称 |
| list[].subjects[].subjectDisplayName | string | 组显示名称 |
| list[].subjects[].types | object | 事件类型列表 |
| list[].subjects[].types.type | string | 组名称 |
| list[].subjects[].types.schema | object | 事件模式定义 |
| pagination | Pagination |  |
| pagination.current | integer | 当前页码 |
| pagination.pageSize | integer | 每页大小 |
| pagination.total | integer | 总记录数 |

**400**: 参数错误

| 字段 | 类型 | 说明 |
|------|------|------|
| code | string (1000400, 1000410, 1000600, 1000601, 100001001, 100001009, 100001099) | 错误代码 |
| message | string (指定名称的订阅不存在,请先订阅, 事件确认的position格式不正确, 参数校验失败，topic名称为空, 参数校验失败，发布事件数量应小于100个, 发布事件为空,请检查, 该接口仅在endpointType=queue时有效, 拉取消息接口请求超时,maxWaitMillis设置太小, 不存在指定名称的topic记录, 指定名称的事件分组不存在，请检查, 指定名称的事件定义不存在，请检查, position 不能为空!, position 未找到, source 不能为空!, type 不能为空!, subject 不能为空!, id 不能为空!, data 不能为空!, specversion 不能为空!, 请求参数校验失败：%s, 异常，请联系系统管理员!, 服务繁忙，请稍候重试, URL地址不正确, 服务初始化中，请稍候再试！) | 错误消息 |
| details | object | 错误详情 |
| timestamp | string (date-time) | 错误发生时间 |

---

### POST /topics

**事件发布**

发送事件。事件为基于 `cloudevent` 类型的事件对象。
可以使用cloudevents 提供的各语言的SDK 来构建 Event 对象，然后将其通过该接口进行提交，以此来发送事件。


#### Request Body

*无定义*

#### Responses

**200**: 发送成功


**400**: 请求参数错误

| 字段 | 类型 | 说明 |
|------|------|------|
| code | string (1000400, 1000410, 1000600, 1000601, 100001001, 100001009, 100001099) | 错误代码 |
| message | string (指定名称的订阅不存在,请先订阅, 事件确认的position格式不正确, 参数校验失败，topic名称为空, 参数校验失败，发布事件数量应小于100个, 发布事件为空,请检查, 该接口仅在endpointType=queue时有效, 拉取消息接口请求超时,maxWaitMillis设置太小, 不存在指定名称的topic记录, 指定名称的事件分组不存在，请检查, 指定名称的事件定义不存在，请检查, position 不能为空!, position 未找到, source 不能为空!, type 不能为空!, subject 不能为空!, id 不能为空!, data 不能为空!, specversion 不能为空!, 请求参数校验失败：%s, 异常，请联系系统管理员!, 服务繁忙，请稍候重试, URL地址不正确, 服务初始化中，请稍候再试！) | 错误消息 |
| details | object | 错误详情 |
| timestamp | string (date-time) | 错误发生时间 |

---


## 事件订阅

### GET /subscriptions

**获取事件订阅列表**

获取事件订阅列表，支持分页查询


#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| current | query | integer | 否 | 当前页码 |
| pageSize | query | integer | 否 | 每页大小 |

#### Responses

**200**: 获取订阅列表成功

| 字段 | 类型 | 说明 |
|------|------|------|
| list | array<EventSubscriptions> |  |
| list[].name | string | 订阅名称 |
| list[].displayName | string | 订阅显示名称 |
| list[].endpointType | string | endpoint 类型 (queue/webhook) |
| list[].supportMultiConsumers | boolean | 是否支持多个消费着 |
| list[].maxPullEvents | integer | 最大拉取事件数 |
| list[].ackMode | string | 确认模式 (AUTO/MANUAL) |
| list[].topics | array<object> | 事件主题列表 |
| list[].topics[].topic | string | 事件主题 |
| list[].topics[].topicDisplayName | string | 主题显示名称 |
| list[].topics[].subjects | array<object> | 主题组 |
| list[].topics[].subjects[].subject | string | 分组 |
| list[].topics[].subjects[].subjectDisplayName | string | 分组显示名称 |
| list[].topics[].subjects[].types | array<string> | 事件类型 |
| list[].createTime | string | 创建时间 |
| pagination | Pagination |  |
| pagination.current | integer | 当前页码 |
| pagination.pageSize | integer | 每页大小 |
| pagination.total | integer | 总记录数 |

**400**: 参数错误

| 字段 | 类型 | 说明 |
|------|------|------|
| code | string (1000400, 1000410, 1000600, 1000601, 100001001, 100001009, 100001099) | 错误代码 |
| message | string (指定名称的订阅不存在,请先订阅, 事件确认的position格式不正确, 参数校验失败，topic名称为空, 参数校验失败，发布事件数量应小于100个, 发布事件为空,请检查, 该接口仅在endpointType=queue时有效, 拉取消息接口请求超时,maxWaitMillis设置太小, 不存在指定名称的topic记录, 指定名称的事件分组不存在，请检查, 指定名称的事件定义不存在，请检查, position 不能为空!, position 未找到, source 不能为空!, type 不能为空!, subject 不能为空!, id 不能为空!, data 不能为空!, specversion 不能为空!, 请求参数校验失败：%s, 异常，请联系系统管理员!, 服务繁忙，请稍候重试, URL地址不正确, 服务初始化中，请稍候再试！) | 错误消息 |
| details | object | 错误详情 |
| timestamp | string (date-time) | 错误发生时间 |

---

### GET /subscriptions/{name}

**事件订阅拉取**

根据订阅名称拉取订阅的相关事件, 事件从上一次ack的位置返回，创建事件订阅时endpointType为queue或ackMode为AUTO时自动提交，不需要再次提交，
一次最多返回事件数量100条，具体参数可通过事件列表接口返回查看。


#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| name | path | string | 是 | 订阅名称，对应订阅列表接口返回字段name |
| maxWaitMillis | query | integer | 否 | 最大等待时间（毫秒） |

#### Responses

**200**: 事件拉取成功

*无定义*


**400**: 参数错误或拉取事件超时

| 字段 | 类型 | 说明 |
|------|------|------|
| code | string (1000400, 1000410, 1000600, 1000601, 100001001, 100001009, 100001099) | 错误代码 |
| message | string (指定名称的订阅不存在,请先订阅, 事件确认的position格式不正确, 参数校验失败，topic名称为空, 参数校验失败，发布事件数量应小于100个, 发布事件为空,请检查, 该接口仅在endpointType=queue时有效, 拉取消息接口请求超时,maxWaitMillis设置太小, 不存在指定名称的topic记录, 指定名称的事件分组不存在，请检查, 指定名称的事件定义不存在，请检查, position 不能为空!, position 未找到, source 不能为空!, type 不能为空!, subject 不能为空!, id 不能为空!, data 不能为空!, specversion 不能为空!, 请求参数校验失败：%s, 异常，请联系系统管理员!, 服务繁忙，请稍候重试, URL地址不正确, 服务初始化中，请稍候再试！) | 错误消息 |
| details | object | 错误详情 |
| timestamp | string (date-time) | 错误发生时间 |

---

### POST /subscriptions/{name}/ack

**确认事件订阅消息成功**

如果订阅的时候选择的是手动确认消息消费，则需要调用该接口进行确认；（创建事件订阅时endpointType为queue或ackMode为AUTO时自动提交，可通过事件列表接口获取, 如不清楚需与订阅创建者联系！）。


#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| name | path | string | 是 | 订阅名称，对应订阅列表接口返回字段name |

#### Request Body

| 字段 | 类型 | 说明 |
|------|------|------|
| position | string | 事件消息的位置信息.用于确认消息时使用，在事件订阅接口/subscriptions/{name}返回值中获取。 |
#### Responses

**200**: 事件确认成功


**400**: 参数错误

| 字段 | 类型 | 说明 |
|------|------|------|
| code | string (1000400, 1000410, 1000600, 1000601, 100001001, 100001009, 100001099) | 错误代码 |
| message | string (指定名称的订阅不存在,请先订阅, 事件确认的position格式不正确, 参数校验失败，topic名称为空, 参数校验失败，发布事件数量应小于100个, 发布事件为空,请检查, 该接口仅在endpointType=queue时有效, 拉取消息接口请求超时,maxWaitMillis设置太小, 不存在指定名称的topic记录, 指定名称的事件分组不存在，请检查, 指定名称的事件定义不存在，请检查, position 不能为空!, position 未找到, source 不能为空!, type 不能为空!, subject 不能为空!, id 不能为空!, data 不能为空!, specversion 不能为空!, 请求参数校验失败：%s, 异常，请联系系统管理员!, 服务繁忙，请稍候重试, URL地址不正确, 服务初始化中，请稍候再试！) | 错误消息 |
| details | object | 错误详情 |
| timestamp | string (date-time) | 错误发生时间 |

---

