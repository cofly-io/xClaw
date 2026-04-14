# supOS UNS（工业元建模）快速手册（给模型用）

目标：当用户对 **UNS/工业元建模** 做“查树/查属性/写入数据”等操作时，优先只读本文件，
避免把超长文档 `supOS_工业元建模_API文档.md` 整篇喂给模型导致浪费 token 与命中不准。

## 使用规则（必须遵守）

- 只要是 supOS Open API 调用，一律用内置工具 `supos_api_call`。
- 需要接口细节时：
  - 先在本文件里找对应接口与参数模板；
  - 本文件没有时，才去读 `supOS_工业元建模_API文档.md`，并且只读对应小节。

**禁止策略漂移（非常重要）**

当用户目标是“对某个 UNS 路径写入/插入模拟数据”，不允许：
- 先去查“字段定义/表结构”再写（除非用户明确要求字段必须匹配真实 schema）
- 读完整长文档
- 转去使用 FaaS/订阅脚本来完成“写入数据”

默认策略：**直接使用 `/realtime/v3/write` 写入一组合理的模拟字段即可。**

## 高频接口速查

### 1) UNS 树查询（懒加载单层）

- **path**：`/os/open-api/uns/v2/instance/condition/tree`
- **method**：POST
- **用途**：按 `parentId` 分页返回某一层的子节点（常用于树形懒加载）。
- **常用参数模板**：

```text
method: post
path: /os/open-api/uns/v2/instance/condition/tree
data: {"parentId":"0","pageNo":1,"pageSize":100,"keyword":"","searchType":1}
```

### 2) UNS 写入（实时数据 + 结构化/关系型数据都走同一个写入口）

- **path**：`/os/open-api/realtime/v3/write`
- **method**：POST
- **强制规则**：向 UNS 节点写数据，无论是“实时点位”还是“模拟关系型/结构化记录”，
  都必须走这个接口。

#### 2.1 写入实时点位（示例）

```text
method: post
path: /os/open-api/realtime/v3/write
data: {
  "timestampPrecision": "ms",
  "datas": [
    {"name":"factory.device_01.temperature","value":{"timeStamp":1711872000000,"status":0,"value":36.8}}
  ]
}
```

#### 2.2 写入结构化/关系型记录（示例）

把“一行记录”拆成多个点：每个字段一个 `datas[].name`，字段值写到
`datas[].value.value`。

```text
method: post
path: /os/open-api/realtime/v3/write
data: {
  "timestampPrecision": "ms",
  "datas": [
    {"name":"table1.id","value":{"timeStamp":1711872000000,"status":0,"value":1}},
    {"name":"table1.work_order_code","value":{"timeStamp":1711872000000,"status":0,"value":"AROrder20260331MOCK"}},
    {"name":"table1.alarm_record_id","value":{"timeStamp":1711872000000,"status":0,"value":0}},
    {"name":"table1.alarm_status","value":{"timeStamp":1711872000000,"status":0,"value":1}}
  ]
}
```

#### 2.3 给“指定 UNS 节点路径”插入模拟记录（强制模板）

当用户给出一个 UNS 节点路径，例如：
`AlarmGuard/AlarmTreatmentMgmt/alarm_treatment`

写入规则如下：
- 把“节点路径”当作点名前缀
- 字段名可以是你生成的合理模拟字段（除非用户指定字段）
- 每个字段一个点写入：`{prefix}.{field}` → `datas[].name`

可直接照抄的写入模板（模拟一条处理单记录）：

```text
method: post
path: /os/open-api/realtime/v3/write
data: {
  "timestampPrecision": "ms",
  "datas": [
    {"name":"AlarmGuard/AlarmTreatmentMgmt/alarm_treatment.id","value":{"timeStamp":1711872000000,"status":0,"value":1}},
    {"name":"AlarmGuard/AlarmTreatmentMgmt/alarm_treatment.work_order_code","value":{"timeStamp":1711872000000,"status":0,"value":"AROrder20260331MOCK"}},
    {"name":"AlarmGuard/AlarmTreatmentMgmt/alarm_treatment.alarm_record_id","value":{"timeStamp":1711872000000,"status":0,"value":0}},
    {"name":"AlarmGuard/AlarmTreatmentMgmt/alarm_treatment.alarm_status","value":{"timeStamp":1711872000000,"status":0,"value":1}},
    {"name":"AlarmGuard/AlarmTreatmentMgmt/alarm_treatment.updated_at","value":{"timeStamp":1711872000000,"status":0,"value":"2026-03-31T17:00:00+08:00"}}
  ]
}
```

> 注意：这里的字段名（id/work_order_code/...）是“模拟关系型记录”的建议字段。
> 如果用户指定字段，就替换为用户字段；但**接口与写法不变**，仍然走 `/realtime/v3/write`。

## 低频能力（按需去长文档精确定位）

当用户要做以下操作，而本手册没覆盖时，再去读长文档并只读对应小节：

- UNS 文件/文件夹创建、模板、导入导出等管理类接口
- 大批量属性/历史查询组合、复杂筛选条件等

长文档路径：`src/copaw/agents/skills/supos_api/docs/supOS_工业元建模_API文档.md`

