# 待办中心 API

**版本**: 1.0.0  
**OpenAPI**: 3.0.3

---
# basePath：/os/open-api/


## 待办中心-流程

### POST /processes

**创建待办流程**

作为后续需要创建的待办任务的总集，管理一个审批流程的开始和结束

#### Request Body

| 字段 | 类型 | 说明 |
|------|------|------|
| thirdProcessId | string | 第三方流程Id, 需要保证唯一性 |
| name | string | 流程名称 |
| moduleName | string | 流程所属模块 |
| initiator | string | 流程发起人Id |
| source | string | 流程来源，创建流程的服务标识 |
| userInitiatedViewUrl | string | 流程处理地址（第三方URL） |
| title | string | 标题 |
| processKey | string | 流程编号 |
| createTime | integer (int64) | 创建时间（13位时间戳，毫秒），非必填，如果不传则使用当前时间 |
#### Responses

**200**: 创建流程操作成功，返回第三方流程id

| 字段 | 类型 | 说明 |
|------|------|------|
| data | object |  |
| data.thirdProcessId | string | 第三方流程ID |

**400**: 请求参数错误

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误代码 |
| message | string | 错误消息 |
| detailMsg | string | 错误详情信息 |
| timestamp | string (date-time) | 错误发生时间 |

---

### GET /processes

**查询待办流程**

可分页查询待办流程信息

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| current | query | integer | 否 | 页码 |
| pageSize | query | integer | 否 | 页大小 |
| processName | query | string | 否 | 流程名称（模糊匹配） |
| moduleName | query | string | 否 | 模块名称 |
| createStartTime | query | integer | 否 | 流程创建时间范围下限，使用毫秒级时间戳 |
| createEndTime | query | integer | 否 | 流程创建时间范围上限，使用毫秒级时间戳 |
| processStatus | query | integer (0, 1, 2) | 否 | 流程状态枚举值：
- 0: 待启动
- 1: 进行中
- 2: 已结束
 |
| initiator | query | string | 否 | 发起人用户ID，如果传入则查询该发起人发起的流程 |
| processKeys | query | array<string> | 否 | 流程编号列表，精确匹配 |
| sources | query | array<string> | 否 | 流程来源列表，精确匹配 |
| title | query | string | 否 | 标题，模糊匹配 |

#### Responses

**200**: 查询成功

| 字段 | 类型 | 说明 |
|------|------|------|
| list | array<Process> | 流程列表数据 |
| list[].name | string | 流程名称 |
| list[].moduleName | string | 所属模块 |
| list[].assignee | string | 当前待办人 |
| list[].assigneeId | string | 当前待办人Id |
| list[].thirdUrl | string | 任务处理地址 |
| list[].processStatus | integer (0, 1, 2) (int32) | 流程状态枚举值：
- 0: 待启动
- 1: 进行中
- 2: 已结束
 |
| list[].createTime | string (date-time) | 创建时间 |
| list[].userInitiatedViewUrl | string | 用户发起的流程，查看url |
| list[].source | string | 流程来源 |
| list[].thirdProcessId | string | 第三方流程id |
| list[].title | string | 标题 |
| list[].processKey | string | 流程编号 |
| pagination | object |  |
| pagination.total | integer (int32) | 总记录数 |
| pagination.current | integer (int32) | 当前页码 |
| pagination.pageSize | integer (int32) | 每页大小 |

**400**: 请求参数错误

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误代码 |
| message | string | 错误消息 |
| detailMsg | string | 错误详情信息 |
| timestamp | string (date-time) | 错误发生时间 |

---

### PUT /processes/{thirdProcessId}

**更新待办流程**

可以修改流程名称，更新流程状态

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| thirdProcessId | path | string | 是 | 第三方流程ID，标识需要修改哪个流程 |

#### Request Body

| 字段 | 类型 | 说明 |
|------|------|------|
| status | integer (1, 2) | 流程状态枚举值：
- 1: 运行中（进行中）
- 2: 已结束
 |
| name | string | 流程名称 |
| userInitiatedViewUrl | string | 流程处理地址（第三方URL） |
| title | string | 标题 |
| processKey | string | 流程编号 |
| deleteTaskIds | array<string> | 待删除的任务id列表（第三方任务id），如果为空则不删除任何任务 |
#### Responses

**204**: 更新流程操作成功


**400**: 请求参数错误

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误代码 |
| message | string | 错误消息 |
| detailMsg | string | 错误详情信息 |
| timestamp | string (date-time) | 错误发生时间 |

---


## 待办中心-任务

### POST /tasks

**创建待办任务**

用户任务，需要用户进行操作处理

#### Request Body

| 字段 | 类型 | 说明 |
|------|------|------|
| thirdTaskId | string | 第三方任务id，需要保证唯一 |
| thirdProcessId | string | 所属流程的第三方流程id |
| thirdUrl | string | 任务处理地址 |
| name | string | 任务名称 |
| assignee | string | 任务处理人用户ID |
| mobileUrl | string | 移动端任务处理地址 |
| detailInfo | string | 详细信息，扩展字段，用户可传入JSON格式的自定义数据 |
| title | string | 标题 |
| processKey | string | 流程编号 |
| createTime | integer (int64) | 创建时间（13位时间戳，毫秒），非必填，如果不传则使用当前时间 |
#### Responses

**200**: 创建任务成功，返回第三方任务id

| 字段 | 类型 | 说明 |
|------|------|------|
| data | object |  |
| data.thirdTaskId | string | 第三方任务ID |

**400**: 请求参数错误

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误代码 |
| message | string | 错误消息 |
| detailMsg | string | 错误详情信息 |
| timestamp | string (date-time) | 错误发生时间 |

---

### GET /tasks

**查询待办任务**

可分页查询待办任务信息

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| current | query | integer | 否 | 页码 |
| pageSize | query | integer | 否 | 页大小 |
| moduleName | query | string | 否 | 模块名称 |
| taskName | query | string | 否 | 任务名称（模糊匹配） |
| processName | query | string | 否 | 流程名称（模糊匹配） |
| createStartTime | query | integer | 否 | 任务创建时间范围下限，使用毫秒级时间戳 |
| createEndTime | query | integer | 否 | 任务创建时间范围上限，使用毫秒级时间戳 |
| parseStartTime | query | integer | 否 | 任务处理时间范围下限，使用毫秒级时间戳 |
| parseEndTime | query | integer | 否 | 任务处理时间范围上限，使用毫秒级时间戳 |
| status | query | string | 否 | 任务状态枚举值，利用该值切换tab：
- 0: 待办
- 2: 已办
 |
| processStatus | query | integer (0, 1, 2) | 否 | 流程状态枚举值：
- 0: 待启动
- 1: 进行中
- 2: 已结束
 |
| initiator | query | string | 否 | 发起人用户ID，如果传入则查询该发起人发起的流程下的任务 |
| processKeys | query | array<string> | 否 | 流程编号列表，精确匹配 |
| sources | query | array<string> | 否 | 流程来源列表，精确匹配 |
| title | query | string | 否 | 标题，模糊匹配 |

#### Responses

**200**: 查询成功

| 字段 | 类型 | 说明 |
|------|------|------|
| list | array<Task> | 任务列表数据 |
| list[].thirdTaskId | string | 第三方任务id |
| list[].name | string | 任务名称 |
| list[].processName | string | 流程名称 |
| list[].moduleName | string | 所属模块 |
| list[].createTime | string (date-time) | 创建时间 |
| list[].parseTime | string (date-time) | 处理时间 |
| list[].initiator | string | 发起人 |
| list[].status | integer (0, 2) (int32) | 任务状态枚举值：
- 0: 待办
- 2: 已办
 |
| list[].processStatus | integer (0, 1, 2) (int32) | 流程状态枚举值：
- 0: 待启动
- 1: 进行中
- 2: 已结束
 |
| list[].thirdUrl | string | 任务处理地址 |
| list[].mobileUrl | string | 移动端任务处理地址 |
| list[].detailInfo | string | 详细信息，扩展字段，JSON格式的自定义数据 |
| list[].source | string | 流程来源 |
| list[].thirdProcessId | string | 第三方流程id |
| list[].title | string | 标题 |
| list[].processKey | string | 流程编号 |
| pagination | object |  |
| pagination.total | integer (int32) | 总记录数 |
| pagination.current | integer (int32) | 当前页码 |
| pagination.pageSize | integer (int32) | 每页大小 |

**400**: 请求参数错误

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误代码 |
| message | string | 错误消息 |
| detailMsg | string | 错误详情信息 |
| timestamp | string (date-time) | 错误发生时间 |

---

### PUT /tasks/{thirdTaskId}

**更新任务**

更新任务的基本信息或状态

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| thirdTaskId | path | string | 是 | 需要更新的任务对应的第三方id |

#### Request Body

| 字段 | 类型 | 说明 |
|------|------|------|
| thirdUrl | string | 任务处理地址 |
| name | string | 任务名称 |
| assignee | string | 任务处理人用户ID |
| status | TaskStatus | 任务状态枚举值：
- 0: 待办
- 2: 已办
 |
#### Responses

**204**: 更新任务成功


**400**: 请求参数错误

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误代码 |
| message | string | 错误消息 |
| detailMsg | string | 错误详情信息 |
| timestamp | string (date-time) | 错误发生时间 |

---

