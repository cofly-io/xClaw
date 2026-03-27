# 服务与订阅脚本

**版本**: v1  
**OpenAPI**: 3.1.0

---
# basePath：/os/open-api/


## 脚本命名空间

### POST /faas/v1/namespaces

**创建命名空间**

#### Request Body

| 字段 | 类型 | 说明 |
|------|------|------|
| name | string | 名称 |
| showName | string | 展示名,默认取名称 |
| iconUrl | string | icon图片路径 |
| source | string (uns, app, supos, customer) | 注册方,目前支持: uns, app, supos, customer(现场手动创建) |
#### Responses

**200**: OK

*无定义*


**400**: Bad Request
* code: 100123002 名称重复


| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误码 |
| message | string | 错误信息 |
| detailMsg | string | 错误详情 |
| targetService | string | 发生错误的目标服务 |

**500**: Internal Server Error

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误码 |
| message | string | 错误信息 |
| detailMsg | string | 错误详情 |
| targetService | string | 发生错误的目标服务 |

---

### GET /faas/v1/namespaces

**查询命名空间**

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| keyword | query | string | 否 | 关键字,匹配名称,名称,描述 |
| source | query | string (uns, app, supos, customer) | 否 | 来源 |
| needLeaf | query | boolean | 否 | 是否需要命名空间下有无子结点信息 |
| current | query | integer | 否 | 页码 |
| pageSize | query | integer | 否 | 每页数据条数 |

#### Responses

**400**: Bad Request

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误码 |
| message | string | 错误信息 |
| detailMsg | string | 错误详情 |
| targetService | string | 发生错误的目标服务 |

**500**: Internal Server Error

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误码 |
| message | string | 错误信息 |
| detailMsg | string | 错误详情 |
| targetService | string | 发生错误的目标服务 |

**200**: OK

*无定义*


---

### GET /faas/v1/namespaces/{name}

**获取命名空间**

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| name | path | string | 是 | 名称 |

#### Responses

**400**: Bad Request
* code: 100123003 命名空间不存在


| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误码 |
| message | string | 错误信息 |
| detailMsg | string | 错误详情 |
| targetService | string | 发生错误的目标服务 |

**500**: Internal Server Error

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误码 |
| message | string | 错误信息 |
| detailMsg | string | 错误详情 |
| targetService | string | 发生错误的目标服务 |

**200**: OK

*无定义*


---

### PUT /faas/v1/namespaces/{name}

**更新命名空间**

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| name | path | string | 是 | 名称 |

#### Request Body

| 字段 | 类型 | 说明 |
|------|------|------|
| showName | string | 展示名 |
| iconUrl | string | icon图片路径 |
#### Responses

**400**: Bad Request
* code: 100123003 命名空间不存在


| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误码 |
| message | string | 错误信息 |
| detailMsg | string | 错误详情 |
| targetService | string | 发生错误的目标服务 |

**500**: Internal Server Error

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误码 |
| message | string | 错误信息 |
| detailMsg | string | 错误详情 |
| targetService | string | 发生错误的目标服务 |

**200**: OK

*无定义*


---

### DELETE /faas/v1/namespaces/{name}

**删除命名空间**

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| name | path | string | 是 | 名称 |

#### Responses

**400**: Bad Request

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误码 |
| message | string | 错误信息 |
| detailMsg | string | 错误详情 |
| targetService | string | 发生错误的目标服务 |

**500**: Internal Server Error

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误码 |
| message | string | 错误信息 |
| detailMsg | string | 错误详情 |
| targetService | string | 发生错误的目标服务 |

**200**: OK

*无定义*


---


## 脚本分组

### POST /faas/v1/groups

**创建分组,名称在父级分组下唯一**

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| namespace | query | string | 是 | 命名空间 |

#### Request Body

| 字段 | 类型 | 说明 |
|------|------|------|
| parentPath | string | 父分组路径,不包含命名空间,缺省表示当前是一级分组 |
| name | string | 名称 |
| showName | string | 展示名,默认取名称 |
#### Responses

**400**: Bad Request
* code: 100123002 名称重复
* code: 100123003 命名空间不存在


| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误码 |
| message | string | 错误信息 |
| detailMsg | string | 错误详情 |
| targetService | string | 发生错误的目标服务 |

**500**: Internal Server Error

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误码 |
| message | string | 错误信息 |
| detailMsg | string | 错误详情 |
| targetService | string | 发生错误的目标服务 |

**200**: OK

*无定义*


---

### PUT /faas/v1/groups

**更新分组**

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| namespace | query | string | 是 | 命名空间 |
| name | query | string | 是 | 分组名称 |
| parentPath | query | string | 否 | 父分组路径,缺省表示没有父分组,即当前修改的是一级分组 |

#### Request Body

| 字段 | 类型 | 说明 |
|------|------|------|
| showName | string | 展示名 |
#### Responses

**400**: Bad Request
* code: 100123004 分组不存在


| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误码 |
| message | string | 错误信息 |
| detailMsg | string | 错误详情 |
| targetService | string | 发生错误的目标服务 |

**500**: Internal Server Error

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误码 |
| message | string | 错误信息 |
| detailMsg | string | 错误详情 |
| targetService | string | 发生错误的目标服务 |

**200**: OK

*无定义*


---

### GET /faas/v1/groups

**获取分组**

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| namespace | query | string | 是 | 命名空间 |
| name | query | string | 是 | 分组名称 |
| parentPath | query | string | 否 | 父分组路径,缺省表示没有父分组,即当前查询的是一级分组 |

#### Responses

**400**: Bad Request
* code: 100123004 分组不存在


| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误码 |
| message | string | 错误信息 |
| detailMsg | string | 错误详情 |
| targetService | string | 发生错误的目标服务 |

**500**: Internal Server Error

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误码 |
| message | string | 错误信息 |
| detailMsg | string | 错误详情 |
| targetService | string | 发生错误的目标服务 |

**200**: OK

*无定义*


---

### DELETE /faas/v1/groups

**删除分组**

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| namespace | query | string | 是 | 命名空间 |
| name | query | string | 是 | 分组名称 |
| parentPath | query | string | 否 | 父分组路径,缺省表示没有父分组,即当前删除的是一级分组 |

#### Responses

**400**: Bad Request
* code: 100123001 分组不为空,不能删除


| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误码 |
| message | string | 错误信息 |
| detailMsg | string | 错误详情 |
| targetService | string | 发生错误的目标服务 |

**500**: Internal Server Error

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误码 |
| message | string | 错误信息 |
| detailMsg | string | 错误详情 |
| targetService | string | 发生错误的目标服务 |

**200**: OK

*无定义*


---


## 订阅脚本

### POST /faas/v1/scripts/subscriptions/javascript

**创建js订阅**

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| namespace | query | string | 是 | 命名空间 |
| brief | query | boolean | 否 | 只包含基本信息: 名称,名称,描述,目录 |
| copyFrom | query | string | 否 | 从另一个订阅拷贝,订阅名称,必须和当前订阅在同一个命名空间 |

#### Request Body

| 字段 | 类型 | 说明 |
|------|------|------|
| groupPath | string | 服务所属分组 |
| name | string | 订阅名称 |
| showName | string | 服务展示名 |
| description | string | 描述 |
| subject | string | 主题: 提供给注册方的扩展字段,用于把服务关联到注册方的某个对象,例如app可以把subject设置为模型标识,这样可以方便的查询模型的所有服务 |
| timeoutSeconds | integer (int32) | 执行超时时间(秒) |
| sourceCode | string | 代码 |
| triggerType | string (event, timing) | 触发类型: event(事件触发), timing(定时触发) |
| timingTrigger | TimingTrigger | 定时触发配置,使用固定周期或者cron表达式 |
| timingTrigger.start | string (date-time) | 开始时间 |
| timingTrigger.end | string (date-time) | 结束时间 |
| timingTrigger.periodSeconds | integer (int64) | 时间间隔(秒) |
| timingTrigger.cronExpr | string | cron表达式 |
| timingTrigger.cronConfig | string | cron表达式配置,仅用于前端展示 |
| eventTriggers | array<EventTrigger> | 事件触发设置 |
| eventTriggers[].event | string | 事件id,格式: 主题命名空间$主题名称$分组命名空间$分组名称$事件名称
  * 内置事件id
    * supos$realtime$supos$realtime$ValueChanged 值变化事件
    * supos$alarm$supos$alarm$AlarmActive 报警触发事件
    * supos$alarm$supos$alarm$AlarmInactive 报警消失事件
    * supos$alarm$supos$alarm$AlarmAck 报警确认事件
  * 事件中心事件,例如/org-event$org$/org-event/org$person$supos.person.created
    * /org-event 主题命名空间
    * org 主题名称
    * /org-event/org 分组命名空间
    * person 分组名称
    * supos.person.created 事件名称
 |
| eventTriggers[].triggerSource | string (uns, iiot) | 触发来源: iiot(采集器位号), uns |
| eventTriggers[].triggerObject | string | 触发对象 
  * iiot: 采集器位号别名,例如temperature
  * uns: uns文件路径,例如factory/device001/temperature
 |
#### Responses

**400**: Bad Request
* code: 100123002 名称重复
* code: 100123003 命名空间不存在
* code: 100123004 分组不存在
* code: 100123006 拷贝的订阅不存在
* code: 100123011 订阅有重复的触发事件


| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误码 |
| message | string | 错误信息 |
| detailMsg | string | 错误详情 |
| targetService | string | 发生错误的目标服务 |

**500**: Internal Server Error

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误码 |
| message | string | 错误信息 |
| detailMsg | string | 错误详情 |
| targetService | string | 发生错误的目标服务 |

**200**: OK

*无定义*


---

### GET /faas/v1/scripts/subscriptions/javascript/{namespace}/{name}

**获取订阅**

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| namespace | path | string | 是 | 命名空间 |
| name | path | string | 是 | 订阅名称 |

#### Responses

**400**: Bad Request
* code: 100123006 订阅不存在


| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误码 |
| message | string | 错误信息 |
| detailMsg | string | 错误详情 |
| targetService | string | 发生错误的目标服务 |

**500**: Internal Server Error

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误码 |
| message | string | 错误信息 |
| detailMsg | string | 错误详情 |
| targetService | string | 发生错误的目标服务 |

**200**: OK

*无定义*


---

### PUT /faas/v1/scripts/subscriptions/javascript/{namespace}/{name}

**更新订阅**

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| namespace | path | string | 是 | 命名空间 |
| name | path | string | 是 | 订阅名称 |

#### Request Body

| 字段 | 类型 | 说明 |
|------|------|------|
| showName | string | 服务展示名 |
| description | string | 描述 |
| subject | string | 主题: 提供给注册方的扩展字段,用于把服务关联到注册方的某个对象,例如app可以把subject设置为模型标识,这样可以方便的查询模型的所有服务 |
| timeoutSeconds | integer (int32) | 执行超时时间(秒) |
| sourceCode | string | 代码 |
| triggerType | string (event, timing) | 触发类型: event(事件触发), timing(定时触发) |
| timingTrigger | TimingTrigger | 定时触发配置,使用固定周期或者cron表达式 |
| timingTrigger.start | string (date-time) | 开始时间 |
| timingTrigger.end | string (date-time) | 结束时间 |
| timingTrigger.periodSeconds | integer (int64) | 时间间隔(秒) |
| timingTrigger.cronExpr | string | cron表达式 |
| timingTrigger.cronConfig | string | cron表达式配置,仅用于前端展示 |
| eventTriggers | array<EventTrigger> | 事件触发设置 |
| eventTriggers[].event | string | 事件id,格式: 主题命名空间$主题名称$分组命名空间$分组名称$事件名称
  * 内置事件id
    * supos$realtime$supos$realtime$ValueChanged 值变化事件
    * supos$alarm$supos$alarm$AlarmActive 报警触发事件
    * supos$alarm$supos$alarm$AlarmInactive 报警消失事件
    * supos$alarm$supos$alarm$AlarmAck 报警确认事件
  * 事件中心事件,例如/org-event$org$/org-event/org$person$supos.person.created
    * /org-event 主题命名空间
    * org 主题名称
    * /org-event/org 分组命名空间
    * person 分组名称
    * supos.person.created 事件名称
 |
| eventTriggers[].triggerSource | string (uns, iiot) | 触发来源: iiot(采集器位号), uns |
| eventTriggers[].triggerObject | string | 触发对象 
  * iiot: 采集器位号别名,例如temperature
  * uns: uns文件路径,例如factory/device001/temperature
 |
| groupPath | string | 服务所属分组 |
#### Responses

**400**: Bad Request
* code: 100123006 订阅不存在


| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误码 |
| message | string | 错误信息 |
| detailMsg | string | 错误详情 |
| targetService | string | 发生错误的目标服务 |

**500**: Internal Server Error

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误码 |
| message | string | 错误信息 |
| detailMsg | string | 错误详情 |
| targetService | string | 发生错误的目标服务 |

**200**: OK

*无定义*


---

### DELETE /faas/v1/scripts/subscriptions/javascript/{namespace}/{name}

**删除订阅**

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| namespace | path | string | 是 | 命名空间 |
| name | path | string | 是 | 订阅名称 |

#### Responses

**400**: Bad Request

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误码 |
| message | string | 错误信息 |
| detailMsg | string | 错误详情 |
| targetService | string | 发生错误的目标服务 |

**500**: Internal Server Error

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误码 |
| message | string | 错误信息 |
| detailMsg | string | 错误详情 |
| targetService | string | 发生错误的目标服务 |

**200**: OK

*无定义*


---


## 服务脚本

### POST /faas/v1/scripts/services/javascript

**创建js服务**

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| namespace | query | string | 是 | 命名空间 |
| brief | query | boolean | 否 | 只包含基本信息: 名称,名称,描述,目录 |
| copyFrom | query | string | 否 | 从另一个订阅拷贝,服务名称,必须和当前服务在同一个命名空间 |

#### Request Body

| 字段 | 类型 | 说明 |
|------|------|------|
| groupPath | string | 服务所属分组,默认无分组,直接在命名空间下 |
| name | string | 服务名称 |
| showName | string | 服务展示名,默认取名称 |
| description | string | 描述 |
| subject | string | 主题: 提供给注册方的扩展字段,用于把服务关联到注册方的某个对象,例如app可以把subject设置为模型标识,这样可以方便的查询模型的所有服务 |
| async | boolean | 异步javascript函数,请参考javascript语言async/await概念 |
| timeoutSeconds | integer (int32) | 执行超时时间(秒) |
| sourceCode | string | 代码 |
| inputs | array<Property> | 请求参数结构 |
| inputs[].name | string | 名称 |
| inputs[].showName | string | 展示名,默认取名称 |
| inputs[].description | string | 描述 |
| inputs[].required | boolean | 是否必须,默认false |
| inputs[].dataType | string (boolean, string, int, long, float, double, array, json) | 数据类型: boolean, string, int, long, float, double, array, json |
| inputs[].defaultValue | string | 默认值 |
| inputs[].example | string | 示例 |
| outputs | array<Property> | 返回结果结构 |
| outputs[].name | string | 名称 |
| outputs[].showName | string | 展示名,默认取名称 |
| outputs[].description | string | 描述 |
| outputs[].required | boolean | 是否必须,默认false |
| outputs[].dataType | string (boolean, string, int, long, float, double, array, json) | 数据类型: boolean, string, int, long, float, double, array, json |
| outputs[].defaultValue | string | 默认值 |
| outputs[].example | string | 示例 |
#### Responses

**400**: Bad Request
* code: 100123002 名称重复
* code: 100123003 命名空间不存在
* code: 100123004 分组不存在
* code: 100123005 拷贝的服务不存在


| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误码 |
| message | string | 错误信息 |
| detailMsg | string | 错误详情 |
| targetService | string | 发生错误的目标服务 |

**500**: Internal Server Error

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误码 |
| message | string | 错误信息 |
| detailMsg | string | 错误详情 |
| targetService | string | 发生错误的目标服务 |

**200**: OK

*无定义*


---

### GET /faas/v1/scripts/services/javascript/{namespace}/{name}

**获取js服务**

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| namespace | path | string | 是 | 命名空间 |
| name | path | string | 是 | 服务名称 |

#### Responses

**400**: Bad Request
* code: 100123005 服务不存在


| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误码 |
| message | string | 错误信息 |
| detailMsg | string | 错误详情 |
| targetService | string | 发生错误的目标服务 |

**500**: Internal Server Error

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误码 |
| message | string | 错误信息 |
| detailMsg | string | 错误详情 |
| targetService | string | 发生错误的目标服务 |

**200**: OK

*无定义*


---

### PUT /faas/v1/scripts/services/javascript/{namespace}/{name}

**更新js服务**

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| namespace | path | string | 是 | 命名空间 |
| name | path | string | 是 | 服务名称 |

#### Request Body

| 字段 | 类型 | 说明 |
|------|------|------|
| groupPath | string | 服务所属分组 |
| showName | string | 服务展示名 |
| description | string | 描述 |
| subject | string | 主题: 提供给注册方的扩展字段,用于把服务关联到注册方的某个对象,例如app可以把subject设置为模型标识,这样可以方便的查询模型的所有服务 |
| async | boolean | 异步javascript函数,请参考javascript语言async/await概念,默认true |
| timeoutSeconds | integer (int32) | 执行超时时间(秒) |
| sourceCode | string | 代码 |
| inputs | array<Property> | 请求参数结构 |
| inputs[].name | string | 名称 |
| inputs[].showName | string | 展示名,默认取名称 |
| inputs[].description | string | 描述 |
| inputs[].required | boolean | 是否必须,默认false |
| inputs[].dataType | string (boolean, string, int, long, float, double, array, json) | 数据类型: boolean, string, int, long, float, double, array, json |
| inputs[].defaultValue | string | 默认值 |
| inputs[].example | string | 示例 |
| outputs | array<Property> | 返回结果结构 |
| outputs[].name | string | 名称 |
| outputs[].showName | string | 展示名,默认取名称 |
| outputs[].description | string | 描述 |
| outputs[].required | boolean | 是否必须,默认false |
| outputs[].dataType | string (boolean, string, int, long, float, double, array, json) | 数据类型: boolean, string, int, long, float, double, array, json |
| outputs[].defaultValue | string | 默认值 |
| outputs[].example | string | 示例 |
#### Responses

**400**: Bad Request
* code: 100123005 服务不存在


| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误码 |
| message | string | 错误信息 |
| detailMsg | string | 错误详情 |
| targetService | string | 发生错误的目标服务 |

**500**: Internal Server Error

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误码 |
| message | string | 错误信息 |
| detailMsg | string | 错误详情 |
| targetService | string | 发生错误的目标服务 |

**200**: OK

*无定义*


---

### DELETE /faas/v1/scripts/services/javascript/{namespace}/{name}

**删除js服务**

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| namespace | path | string | 是 | 命名空间 |
| name | path | string | 是 | 服务名称 |

#### Responses

**400**: Bad Request

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误码 |
| message | string | 错误信息 |
| detailMsg | string | 错误详情 |
| targetService | string | 发生错误的目标服务 |

**500**: Internal Server Error

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误码 |
| message | string | 错误信息 |
| detailMsg | string | 错误详情 |
| targetService | string | 发生错误的目标服务 |

**200**: OK

*无定义*


---

### POST /faas/v1/scripts/services/sql

**创建sql服务**

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| namespace | query | string | 是 | 命名空间 |
| brief | query | boolean | 否 | 只包含基本信息: 名称,名称,描述,目录 |
| copyFrom | query | string | 否 | 从另一个服务拷贝,服务名称 |

#### Request Body

| 字段 | 类型 | 说明 |
|------|------|------|
| groupPath | string | 服务所属分组,默认没有分组,直接在命名空间下 |
| name | string | 服务名称 |
| showName | string | 服务展示名,默认取名称 |
| description | string | 描述 |
| subject | string | 主题: 提供给注册方的扩展字段,用于把服务关联到注册方的某个对象,例如app可以把subject设置为模型标识,这样可以方便的查询模型的所有服务 |
| timeoutSeconds | integer (int32) | 执行超时时间(秒) |
| sourceCode | string | 代码 |
| inputs | array<Property> | 请求参数结构 |
| inputs[].name | string | 名称 |
| inputs[].showName | string | 展示名,默认取名称 |
| inputs[].description | string | 描述 |
| inputs[].required | boolean | 是否必须,默认false |
| inputs[].dataType | string (boolean, string, int, long, float, double, array, json) | 数据类型: boolean, string, int, long, float, double, array, json |
| inputs[].defaultValue | string | 默认值 |
| inputs[].example | string | 示例 |
| outputs | array<Property> | 返回结果结构 |
| outputs[].name | string | 名称 |
| outputs[].showName | string | 展示名,默认取名称 |
| outputs[].description | string | 描述 |
| outputs[].required | boolean | 是否必须,默认false |
| outputs[].dataType | string (boolean, string, int, long, float, double, array, json) | 数据类型: boolean, string, int, long, float, double, array, json |
| outputs[].defaultValue | string | 默认值 |
| outputs[].example | string | 示例 |
| sqlType | string (select, procedure) | sql类型: select:查询,procedure:存储过程 |
| dataSourceFrom | string (biz, datalake) | 数据库来源: biz(业务数据源),lake(数据湖开放的数据源) |
| dataSourceType | string (fedquery, mysql, sqlserver, oracle, kingbasees, postgres, dameng) | 数据源类型 |
| dataSource | string | 数据源名称 |
#### Responses

**400**: Bad Request
* code: 100123002 名称重复
* code: 100123003 命名空间不存在
* code: 100123004 分组不存在
* code: 100123005 拷贝的服务不存在


| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误码 |
| message | string | 错误信息 |
| detailMsg | string | 错误详情 |
| targetService | string | 发生错误的目标服务 |

**500**: Internal Server Error

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误码 |
| message | string | 错误信息 |
| detailMsg | string | 错误详情 |
| targetService | string | 发生错误的目标服务 |

**200**: OK

*无定义*


---

### GET /faas/v1/scripts/services/sql/{namespace}/{name}

**获取sql服务**

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| namespace | path | string | 是 | 命名空间 |
| name | path | string | 是 | 服务名称 |

#### Responses

**400**: Bad Request
* code: 100123005 服务不存在


| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误码 |
| message | string | 错误信息 |
| detailMsg | string | 错误详情 |
| targetService | string | 发生错误的目标服务 |

**500**: Internal Server Error

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误码 |
| message | string | 错误信息 |
| detailMsg | string | 错误详情 |
| targetService | string | 发生错误的目标服务 |

**200**: OK

*无定义*


---

### PUT /faas/v1/scripts/services/sql/{namespace}/{name}

**更新sql服务**

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| namespace | path | string | 是 | 命名空间 |
| name | path | string | 是 | 服务名称 |

#### Request Body

| 字段 | 类型 | 说明 |
|------|------|------|
| groupPath | string | 服务所属分组 |
| showName | string | 服务展示名 |
| description | string | 描述 |
| subject | string | 主题: 提供给注册方的扩展字段,用于把服务关联到注册方的某个对象,例如app可以把subject设置为模型标识,这样可以方便的查询模型的所有服务 |
| timeoutSeconds | integer (int32) | 执行超时时间(秒) |
| sourceCode | string | 代码 |
| inputs | array<Property> | 请求参数结构 |
| inputs[].name | string | 名称 |
| inputs[].showName | string | 展示名,默认取名称 |
| inputs[].description | string | 描述 |
| inputs[].required | boolean | 是否必须,默认false |
| inputs[].dataType | string (boolean, string, int, long, float, double, array, json) | 数据类型: boolean, string, int, long, float, double, array, json |
| inputs[].defaultValue | string | 默认值 |
| inputs[].example | string | 示例 |
| outputs | array<Property> | 返回结果结构 |
| outputs[].name | string | 名称 |
| outputs[].showName | string | 展示名,默认取名称 |
| outputs[].description | string | 描述 |
| outputs[].required | boolean | 是否必须,默认false |
| outputs[].dataType | string (boolean, string, int, long, float, double, array, json) | 数据类型: boolean, string, int, long, float, double, array, json |
| outputs[].defaultValue | string | 默认值 |
| outputs[].example | string | 示例 |
| sqlType | string (select, procedure) | sql类型: select:查询,procedure:存储过程 |
| dataSourceFrom | string (biz, datalake) | 数据库来源: biz(业务数据源),lake(数据湖开放的数据源) |
| dataSourceType | string (fedquery, mysql, sqlserver, oracle, kingbasees, postgres, dameng) | 数据源类型 |
| dataSource | string | 数据源名称 |
#### Responses

**400**: Bad Request
* code: 100123005 服务不存在


| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误码 |
| message | string | 错误信息 |
| detailMsg | string | 错误详情 |
| targetService | string | 发生错误的目标服务 |

**500**: Internal Server Error

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误码 |
| message | string | 错误信息 |
| detailMsg | string | 错误详情 |
| targetService | string | 发生错误的目标服务 |

**200**: OK

*无定义*


---

### DELETE /faas/v1/scripts/services/sql/{namespace}/{name}

**删除sql服务**

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| namespace | path | string | 是 | 命名空间 |
| name | path | string | 是 | 服务名称 |

#### Responses

**400**: Bad Request

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误码 |
| message | string | 错误信息 |
| detailMsg | string | 错误详情 |
| targetService | string | 发生错误的目标服务 |

**500**: Internal Server Error

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误码 |
| message | string | 错误信息 |
| detailMsg | string | 错误详情 |
| targetService | string | 发生错误的目标服务 |

**200**: OK

*无定义*


---

### POST /sql-runtime/v1/calls

**运行sql服务**

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| current | query | integer | 否 | 页码 |
| pageSize | query | integer | 否 | 每页数据条数 |
| countTotal | query | boolean | 否 | 是否返回总数据条数,默认true,当数据量特别大时,count会特别耗时,设置为false跳过count可以提高速度 |

#### Request Body

| 字段 | 类型 | 说明 |
|------|------|------|
| namespace | string | 调用服务所属命名空间 |
| service | string | 调用服务名称 |
| args | array<object> | 实参列表 |
#### Responses

**400**: Bad Request
* code: 100123005 服务不存在
* code: 100121001 解析sql参数值失败
* code: 100121002 必填参数没有值
* code: 100121004 不支持执行多条sql语句
* code: 100121005 mybatis解析动态sql失败,请检查sql内容
* code: 100121006 查询结果超过3000行限制
* code: 100121007 找不到存储过程
* code: 100121008 存储过程参数不匹配
* code: 100121009 执行存储过程报错
* code: 100121010 存储过程语法错误
* code: 100121011 sql语法错误
* code: 100121012 存储过程入参重复
* code: 100121013 存储过程出参重复


| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误码 |
| message | string | 错误信息 |
| detailMsg | string | 错误详情 |
| targetService | string | 发生错误的目标服务 |

**500**: Internal Server Error
* code: 100121003 序列化查询结果失败
* code: 100121000 sql执行失败


| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误码 |
| message | string | 错误信息 |
| detailMsg | string | 错误详情 |
| targetService | string | 发生错误的目标服务 |

**200**: OK

| 字段 | 类型 | 说明 |
|------|------|------|
| data | object | 调用结果 |
| list | array<object> | 多条数据结果 |
| pagination | Pagination |  |
| pagination.total | integer (int32) | 总数据条数,作为返回结构时有效 |
| pagination.current | integer (int32) | 当前页 |
| pagination.pageSize | integer (int32) | 每页数据条数 |
| pagination.countTotal | boolean | 是否返回总数据条数,作为请求时有效 |

---

### POST /js-runtime/v1/calls

**运行js服务**

#### Request Body

| 字段 | 类型 | 说明 |
|------|------|------|
| namespace | string | 调用服务所属命名空间 |
| service | string | 调用服务名称 |
| args | array<object> | 实参列表 |
#### Responses

**400**: Bad Request
* code: 100123005 服务不存在
* code: 100120006 不支持导入该javascript模块,存在安全风险
* code: 100120007 不支持导入本地模块
* code: 100120009 无效的调用参数: 不符合命名空间.服务名格式
* code: 100120013 javascript语法错误


| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误码 |
| message | string | 错误信息 |
| detailMsg | string | 错误详情 |
| targetService | string | 发生错误的目标服务 |

**500**: Internal Server Error
* code: 100120010 内存不足
* code: 100120012 执行超时


| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误码 |
| message | string | 错误信息 |
| detailMsg | string | 错误详情 |
| targetService | string | 发生错误的目标服务 |

**200**: OK

| 字段 | 类型 | 说明 |
|------|------|------|
| data | object | 调用结果 |
| list | array<object> | 多条数据结果 |

---


## 脚本综合查询

### GET /faas/v1/scripts

**查询脚本基本信息**

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| type | query | string (service, subscription) | 否 | 脚本类型 |
| codeLanguage | query | string (javascript, sql) | 否 | 代码语言 |
| namespace | query | string | 否 | 命名空间 |
| groupPath | query | string | 否 | 分组路径 |
| recursive | query | boolean | 否 | 是否在分组路径下递归搜索 |
| subject | query | string | 否 | 主题 |
| sqlType | query | string (select, procedure) | 否 | sqlType语句类型: select, procedure |
| keyword | query | string | 否 | 关键字,匹配名称,展示名 |
| current | query | integer | 否 | 页码 |
| pageSize | query | integer | 否 | 每页数据条数 |

#### Responses

**400**: Bad Request

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误码 |
| message | string | 错误信息 |
| detailMsg | string | 错误详情 |
| targetService | string | 发生错误的目标服务 |

**500**: Internal Server Error

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误码 |
| message | string | 错误信息 |
| detailMsg | string | 错误详情 |
| targetService | string | 发生错误的目标服务 |

**200**: OK

| 字段 | 类型 | 说明 |
|------|------|------|
| pagination | Pagination |  |
| pagination.total | integer (int32) | 总数据条数,作为返回结构时有效 |
| pagination.current | integer (int32) | 当前页 |
| pagination.pageSize | integer (int32) | 每页数据条数 |
| pagination.countTotal | boolean | 是否返回总数据条数,作为请求时有效 |
| list | array<BriefScriptView> |  |
| list[].id | string | 脚本id |
| list[].type | string (service, subscription) | 脚本类型 |
| list[].source | string (uns, app, supos, customer) | 来源,取所属namespace的source |
| list[].namespace | string | 命名空间 |
| list[].groupPath | string | 服务所属分组 |
| list[].name | string | 服务名称 |
| list[].showName | string | 服务展示名 |
| list[].subject | string | 主题 |
| list[].codeLanguage | string (javascript, sql) | 代码语言 |
| list[].description | string | 脚本描述 |
| list[].creator | string | 创建人 |
| list[].modifier | string | 修改人 |
| list[].createTime | string (date-time) | 创建时间 |
| list[].modifyTime | string (date-time) | 修改时间 |

---


## 脚本执行记录

### GET /faas/v1/executions

**获取订阅执行记录**

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| namespace | query | string | 是 | 命名空间 |
| name | query | string | 是 | 脚本名称 |
| start | query | string | 否 | 开始时间 |
| end | query | string | 否 | 结束时间 |
| current | query | integer | 否 | 页码 |
| pageSize | query | integer | 否 | 每页数据条数 |

#### Responses

**400**: Bad Request

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误码 |
| message | string | 错误信息 |
| detailMsg | string | 错误详情 |
| targetService | string | 发生错误的目标服务 |

**500**: Internal Server Error

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误码 |
| message | string | 错误信息 |
| detailMsg | string | 错误详情 |
| targetService | string | 发生错误的目标服务 |

**200**: OK

| 字段 | 类型 | 说明 |
|------|------|------|
| pagination | Pagination |  |
| pagination.total | integer (int32) | 总数据条数,作为返回结构时有效 |
| pagination.current | integer (int32) | 当前页 |
| pagination.pageSize | integer (int32) | 每页数据条数 |
| pagination.countTotal | boolean | 是否返回总数据条数,作为请求时有效 |
| list | array<ScriptExecution> |  |
| list[].id | integer (int64) | 执行记录唯一标识 |
| list[].namespace | string | 脚本命名空间 |
| list[].name | string | 脚本名称 |
| list[].args | string | 执行入参 |
| list[].result | string | 执行结果 |
| list[].status | integer (-1, 0, 1) (int32) | 执行状态(-1已调度,0失败,1成功) |
| list[].scheduleTime | string (date-time) | 调度时间 |
| list[].startTime | string (date-time) | 开始执行时间 |
| list[].spend | integer (int64) | 耗时(毫秒) |
| list[].error | string | 执行失败原因 |

---

