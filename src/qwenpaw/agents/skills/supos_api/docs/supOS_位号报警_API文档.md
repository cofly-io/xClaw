# supOS 报警管理

**版本**: 1.0.0
**OpenAPI**: 3.0.3
**说明**: 主要用于UNS命名路径节点中的消息体内字段上下线报警

---
# basePath：/os/open-api/alarm/

## 报警记录结构

### HistoricalAlarmRecord

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| uniqueId | string | 是 | 报警全局唯一标识，在一个报警周期内唯一 |
| id | string | 是 | 报警id，如某个温度位号的HH报警，由组态决定 |
| name | string | 是 | 报警名称，由组态决定 |
| description | string | 否 | 报警对象的详细描述 |
| specificType | string | 是 | 具体类型：LimitAlarm, DiscreteAlarm, RateOfChangeAlarm, DeviationAlarm, SystemAlarm |
| detailSubType | string | 是 | 子类型：H, HH, L, LL, ON, OFF |
| category | string | 是 | 一级分类：Process, System 等 |
| group | string | 否 | 报警所属逻辑分组 |
| sourceId | string | 是 | 报警源ID，位号别名或者uns别名 |
| sourceName | string | 是 | 报警源名称，位号名或者uns文件名 |
| sourcePath | string | 否 | 报警源路径 |
| sourceType | string | 是 | 报警源类型：uns, iot |
| property | string | 否 | 报警源是多属性结构时，指明哪个属性触发的报警 |
| activeTime | integer | 是 | 报警进入激活状态的时间戳（UTC时间戳） |
| inactiveTime | integer | 否 | 报警进入失效状态的时间戳 |
| ackTime | integer | 否 | 报警被确认的时间戳 |
| inactived | boolean | 是 | 报警是否已进入失效状态 |
| acked | boolean | 是 | 报警是否已被确认 |
| actorId | string | 否 | 执行报警确认操作的人员ID或名称 |
| ackComment | string | 否 | 报警确认时输入的备注信息 |
| priority | integer | 是 | 报警优先级，1-10级 |
| value | object | 是 | 报警触发时的测量值信息 |
| value.value | number | 是 | 报警激活时的测量值 |
| value.status | integer | 是 | 报警的数据质量码 |
| value.timestamp | integer | 是 | 测量值的时间戳 |
| conditionDefine | string | 否 | 报警触发的条件定义 |

---

## 原始报警查询

### POST /history/v1/raw

**原始历史报警记录查询**

支持按多层级路径、多条件组合过滤及分页查询原始历史报警记录

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|

#### Request Body

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| clientId | string | 是 | 业务标识ID，用于区分不同业务场景，不能为空 |
| uniqueIds | array<string> | 否 | 按报警全局唯一标识符过滤，指定后其他过滤条件无效 |
| activeTimeBegin | string | 否 | 报警激活时间下限（格式：2024-08-01T00:00:00.000+08:00） |
| activeTimeEnd | string | 否 | 报警激活时间上限 |
| ackTimeBegin | string | 否 | 报警确认时间下限（仅对已确认报警有效） |
| ackTimeEnd | string | 否 | 报警确认时间上限 |
| inactiveTimeBegin | string | 否 | 报警失效时间下限（仅对已失效报警有效） |
| inactiveTimeEnd | string | 否 | 报警失效时间上限 |
| sourceIds | array<string> | 否 | 按报警源唯一标识符精确过滤 |
| sourceNames | array<string> | 否 | 按报警源显示名称精确过滤 |
| sourceNameLike | string | 否 | 按报警源显示名称模糊查询 |
| sourcePaths | array<string> | 否 | 按源在系统层级中的路径查询 |
| sourceTypes | array<string> | 否 | 按报警源类型过滤：uns, iot |
| acked | boolean | 否 | 按是否已确认过滤 |
| inactived | boolean | 否 | 按是否已消除过滤 |
| keyword | string | 否 | 关键字，用于模糊匹配报警源名称、路径、描述字段 |
| specificTypes | array<string> | 否 | 按报警的具体类型过滤：LimitAlarm, DiscreteAlarm, RateOfChangeAlarm, DeviationAlarm, SystemAlarm |
| detailSubTypes | array<string> | 否 | 按子类型过滤：H, HH, L, LL, ON, OFF |
| categories | array<string> | 否 | 按一级大类过滤 |
| groups | array<string> | 否 | 按逻辑分组查询 |
| priorityRange | array[min,max] | 否 | 优先级区间，[min, max]表示>=min且<=max |
| prioritySet | array<integer> | 否 | 指定优先级列表，只过滤优先级存在此列表中的报警 |
| actorIds | array<string> | 否 | 按报警确认人ID精确过滤 |
| ackCommentsLike | string | 否 | 按确认备注信息模糊查询 |
| timestampPrecision | string | 否 | 时间戳精度：s(秒), ms(毫秒), us(微秒)，默认ms |
| pageNum | integer | 否 | 页码，从1开始，默认1 |
| pageSize | integer | 否 | 每页记录数，默认50，最大1000 |
| sortBy | string | 否 | 排序字段：activeTime, ackTime, inactiveTime, priority，默认activeTime |
| sortOrder | string | 否 | 排序方向：asc, desc，默认desc |
| fields | array<string> | 否 | 指定返回的报警记录字段 |

#### Responses

**200**:

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer | 响应状态编码，0表示成功 |
| message | string | 响应结果的文字描述 |
| data.records | array<HistoricalAlarmRecord> | 当前页的原始报警记录列表 |
| data.total | integer | 符合条件的总记录数 |
| data.pageNum | integer | 当前页码 |
| data.pageSize | integer | 每页记录数 |

**400**:

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer | 错误编码 |
| message | string | 错误描述 |

---

## 报警统计分析

### POST /history/v1/statistics

**历史报警记录统计分析**

支持按多维度聚合、时间划分及过滤条件进行报警记录统计分析

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|

#### Request Body

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| clientId | string | 是 | 业务标识ID，用于区分不同业务场景 |
| beginTime | string | 是 | 开始时间（格式：2024-08-01T00:00:00.000+08:00） |
| endTime | string | 是 | 结束时间 |
| timeBucket | string | 否 | 时间划分粒度：hour, day, none，默认none |
| filterBy | string | 否 | 过滤维度：sourceName, name, sourcePath, group |
| filterValues | array<string> | 否 | 过滤值列表 |
| groupBy | string | 是 | 聚合维度：sourceName, name, sourcePath, group, priorityRange, ackStatus |
| priorityRanges | object | 否 | 优先级区间定义，键名为区间标识，值为[min,max]，仅当groupBy为priorityRange时有效 |
| categoryBy | string | 否 | 结果分类方式：time(按时间归类), aggregate(按聚合对象归类)，默认time |
| topN | integer | 否 | 返回前N个聚合结果，默认100，最大100 |
| sortBy | string | 否 | 排序字段：count, time，默认count |
| sortOrder | string | 否 | 排序方向：asc, desc，默认desc |

#### Responses

**200**:

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer | 响应状态编码，0表示成功 |
| message | string | 响应结果的文字描述 |
| data.timeRange | object | 时间范围 |
| data.timeBucket | string | 时间划分粒度 |
| data.groupBy | string | 聚合维度 |
| data.categoryBy | string | 结果分类方式 |
| data.topN | integer | 返回前N个聚合结果 |
| data.priorityRanges | object | 优先级区间定义 |
| data.statistics | array/object | 统计数据，按categoryBy不同返回不同结构 |

**400**:

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer | 错误编码 |
| message | string | 错误描述 |

---

## 调用示例

### 查询原始报警记录

```bash
supos_api_call(
  method="post",
  path="/os/open-api/alarm/history/v1/raw",
  data={
    "clientId": "production-monitor-001",
    "activeTimeBegin": "2024-08-01T00:00:00.000+08:00",
    "activeTimeEnd": "2024-08-31T23:59:59.999+08:00",
    "pageNum": 1,
    "pageSize": 50,
    "sortBy": "activeTime",
    "sortOrder": "desc"
  }
)
```

### 统计每日报警数量

```bash
supos_api_call(
  method="post",
  path="/os/open-api/alarm/history/v1/statistics",
  data={
    "clientId": "production-analytics-002",
    "beginTime": "2024-08-01T00:00:00.000+08:00",
    "endTime": "2024-08-31T23:59:59.999+08:00",
    "timeBucket": "day",
    "groupBy": "name",
    "categoryBy": "time",
    "topN": 10,
    "sortBy": "count",
    "sortOrder": "desc"
  }
)
```

---

## 注意事项

- **clientId 为必填字段**，用于标识业务场景，为空时将返回400错误
- 所有时间计算均基于报警的激活时间（activeTime）
- 多个时间条件为逻辑与(AND)关系
- 最大查询时间范围为90天，超过此范围将返回错误
- 当groupBy为priorityRange时，必须指定priorityRanges参数
- 当groupBy为ackStatus时，返回结果中键固定为'acked'和'unAcked'
