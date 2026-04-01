# “工业元”建模(也称为uns，统一命名空间，united namespace)

**版本**: 1.0.0  
**OpenAPI**: 3.0.1

---
# basePath：/os/open-api/uns/

## 文件夹/文件管理

### GET /folder/schema

**查询文件夹schema 元数据结构**

文件夹schema 定义结构

#### Responses

**200**: 

*无定义*


---

### GET /file/schema

**查询文件schema 元数据结构**

文件夹schema 定义结构

#### Responses

**200**: 

*无定义*


---

### GET /folder/{alias}

**别名查询文件夹详情**

根据文件夹别名查询文件夹详细信息。

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| alias | path | string | 是 | 别名 |

#### Responses

**200**: OK

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误码，200--正常，其他失败 |
| msg | string | 错误信息 |
| data | object |  |
| data.id | string | ID |
| data.name | string | 名称 |
| data.displayName | string | 显示名 |
| data.alias | string | 别名 |
| data.parentAlias | string | 父级别名 |
| data.path | string | 全路径 |
| data.pathName | string | 路径名 |
| data.description | string | 模型描述 |
| data.definition | array<FieldDefine> | 字段定义 |
| data.definition[].name | string | 字段名：字母开头，支持字母、数字和下划线，最长63 |
| data.definition[].type | string | 字段类型：INTEGER, LONG, FLOAT, DOUBLE, BOOLEAN, DATETIME, STRING |
| data.definition[].unique | boolean | 是否唯一约束，新建模板时，此参数不生效 |
| data.definition[].index | string | 对应的协议字段key，新建模板时，此参数不生效 |
| data.definition[].displayName | string | 显示名 |
| data.definition[].remark | string | 备注 |
| data.definition[].maxLen | integer (int32) | 最大长度(string字段类型生效) |
| data.definition[].systemField | boolean | 是否系统参数，新建模板时，此参数不生效 |
| data.definition[].unit | string | 位号单位 最长5 |
| data.definition[].upperLimit | number | 里程上限 |
| data.definition[].lowerLimit | number | 里程下限 |
| data.definition[].decimal | integer | 小数精度位数 |
| data.extendProperties | object | 扩展属性 |
| data.templateAlias | string | 关联的模板别名 |
| data.updateTime | integer (int64) | 修改时间--单位：毫秒 |
| data.createTime | integer (int64) | 创建时间--单位：毫秒 |

**400**: Bad Request

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 状态码 200-成功 400-参数错误 500-接口异常 |
| msg | string | 响应消息 |
| data | object | 响应数据 |

**405**: Method Not Allowed

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 状态码 200-成功 400-参数错误 500-接口异常 |
| msg | string | 响应消息 |
| data | object | 响应数据 |

---

### GET /file/{alias}

**别名查询文件详情**

根据文件别名查询文件详细信息。

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| alias | path | string | 是 | 别名 |

#### Responses

**200**: OK

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误码，0--正常，其他失败 |
| msg | string | 错误信息 |
| data | object |  |
| data.id | string | 文件ID |
| data.name | string | 文件名 |
| data.displayName | string | 显示名 |
| data.alias | string | 别名 |
| data.parentAlias | string | 父级别名 |
| data.path | string | 全路径 |
| data.dataType | integer (int32) | 1--时序，2--关系，3--计算型, 6--聚合 7--引用 |
| data.pathType | integer (int32) | 文件类型 0--文件夹，2--文件 |
| data.definition | array<object> | 字段定义 |
| data.definition[].name | string | 字段名：字母开头，支持字母、数字和下划线 最长63 |
| data.definition[].type | string | 字段类型：INTEGER, LONG, FLOAT, DOUBLE, BOOLEAN, DATETIME, STRING |
| data.definition[].unique | boolean | 是否唯一约束，新建模板时，此参数不生效 |
| data.definition[].index | string | 对应的协议字段key，新建模板时，此参数不生效 |
| data.definition[].displayName | string | 显示名 |
| data.definition[].remark | string | 备注 |
| data.definition[].maxLen | integer (int32) | 最大长度(string字段类型生效) |
| data.definition[].systemField | boolean | 是否系统参数，新建模板时，此参数不生效 |
| data.definition[].unit | string | 位号单位 最长5 |
| data.definition[].upperLimit | number | 里程上限 |
| data.definition[].lowerLimit | number | 里程下限 |
| data.definition[].decimal | integer | 小数精度位数 |
| data.description | string | 描述 |
| data.persistence | boolean | 是否持久化 |
| data.expression | string | 表达式，引用用 id |
| data.frequency | string | 聚合计算频率：当聚合类型时(dataType=6)的计算时间间隔，单位支持：秒:s 分钟:m 小时：h；如三分钟：3m |
| data.showExpression | string | 用于展示的表达式，引用用 path |
| data.refers | array<refres> | 引用对象 |
| data.refers[].alias | string | 引用的文件别名 |
| data.refers[].field | string | 引用的字段 |
| data.refers[].uts | boolean | 是否引用文件的质量码和时间戳，当文件dataType=3计算型时生效，默认为false |
| data.pathName | string | 文件路径名 |
| data.templateAlias | string | 引用的模板别名 |
| data.extendProperties | object | 扩展属性 |
| data.updateTime | integer (int64) | 修改时间--单位：毫秒 |
| data.createTime | integer (int64) | 创建时间--单位：毫秒 |

**400**: Bad Request

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 状态码 200-成功 400-参数错误 500-接口异常 |
| msg | string | 响应消息 |
| data | object | 响应数据 |

**405**: Method Not Allowed

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 状态码 200-成功 400-参数错误 500-接口异常 |
| msg | string | 响应消息 |
| data | object | 响应数据 |

---

### GET /folder/byPath

**路径查询文件夹详情**

根据路径查询文件夹详细信息。

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| path | query | string | 否 |  |

#### Responses

**200**: OK

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误码，200--正常，其他失败 |
| msg | string | 错误信息 |
| data | object |  |
| data.id | string | ID |
| data.alias | string | 别名 |
| data.parentAlias | string | 父级别名 |
| data.path | string | 全路径 |
| data.definition | array<FieldDefine> | 字段定义 |
| data.definition[].name | string | 字段名：字母开头，支持字母、数字和下划线，最长63 |
| data.definition[].type | string | 字段类型：INTEGER, LONG, FLOAT, DOUBLE, BOOLEAN, DATETIME, STRING |
| data.definition[].unique | boolean | 是否唯一约束，新建模板时，此参数不生效 |
| data.definition[].index | string | 对应的协议字段key，新建模板时，此参数不生效 |
| data.definition[].displayName | string | 显示名 |
| data.definition[].remark | string | 备注 |
| data.definition[].maxLen | integer (int32) | 最大长度(string字段类型生效) |
| data.definition[].systemField | boolean | 是否系统参数，新建模板时，此参数不生效 |
| data.definition[].unit | string | 位号单位 最长5 |
| data.definition[].upperLimit | number | 里程上限 |
| data.definition[].lowerLimit | number | 里程下限 |
| data.definition[].decimal | integer | 小数精度位数 |
| data.description | string | 模型描述 |
| data.name | string | 名称 |
| data.displayName | string | 显示名 |
| data.pathName | string | 路径名 |
| data.extendProperties | object | 扩展属性 |
| data.templateAlias | string | 关联的模板别名 |
| data.updateTime | integer (int64) | 修改时间--单位：毫秒 |
| data.createTime | integer (int64) | 创建时间--单位：毫秒 |

**400**: Bad Request

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 状态码 200-成功 400-参数错误 500-接口异常 |
| msg | string | 响应消息 |
| data | object | 响应数据 |

**405**: Method Not Allowed

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 状态码 200-成功 400-参数错误 500-接口异常 |
| msg | string | 响应消息 |
| data | object | 响应数据 |

---

### GET /file/byPath

**路径查询文件详情**

根据路径查询文件详细信息。

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| path | query | string | 否 |  |

#### Responses

**200**: OK

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误码，0--正常，其他失败 |
| msg | string | 错误信息 |
| data | InstanceDetail |  |
| data.id | string | 文件ID |
| data.name | string | 文件名 |
| data.displayName | string | 显示名 |
| data.alias | string | 别名 |
| data.parentAlias | string | 父级别名 |
| data.path | string | 全路径 |
| data.dataType | integer (int32) | 1--时序，2--关系，3--计算型, 6--聚合 7--引用 |
| data.pathType | integer (int32) | 文件类型 0--文件夹，2--文件 |
| data.definition | array<FieldDefine> | 字段定义 |
| data.definition[].name | string | 字段名：字母开头，支持字母、数字和下划线，最长63 |
| data.definition[].type | string | 字段类型：INTEGER, LONG, FLOAT, DOUBLE, BOOLEAN, DATETIME, STRING |
| data.definition[].unique | boolean | 是否唯一约束，新建模板时，此参数不生效 |
| data.definition[].index | string | 对应的协议字段key，新建模板时，此参数不生效 |
| data.definition[].displayName | string | 显示名 |
| data.definition[].remark | string | 备注 |
| data.definition[].maxLen | integer (int32) | 最大长度(string字段类型生效) |
| data.definition[].systemField | boolean | 是否系统参数，新建模板时，此参数不生效 |
| data.definition[].unit | string | 位号单位 最长5 |
| data.definition[].upperLimit | number | 里程上限 |
| data.definition[].lowerLimit | number | 里程下限 |
| data.definition[].decimal | integer | 小数精度位数 |
| data.description | string | 描述 |
| data.persistence | boolean | 是否持久化 |
| data.expression | string | 表达式，引用用 id |
| data.frequency | string | 聚合计算频率：当聚合类型时(dataType=6)的计算时间间隔，单位支持：秒:s 分钟:m 小时：h；如三分钟：3m |
| data.showExpression | string | 用于展示的表达式，引用用 path |
| data.refers | array<refres> | 引用对象 |
| data.refers[].alias | string | 引用的文件别名 |
| data.refers[].field | string | 引用的字段 |
| data.refers[].uts | boolean | 是否引用文件的质量码和时间戳，当文件dataType=3计算型时生效，默认为false |
| data.pathName | string | 文件路径名 |
| data.templateAlias | string | 引用的模板别名 |
| data.extendProperties | object | 扩展属性 |
| data.updateTime | integer (int64) | 修改时间--单位：毫秒 |
| data.createTime | integer (int64) | 创建时间--单位：毫秒 |

**400**: Bad Request

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 状态码 200-成功 400-参数错误 500-接口异常 |
| msg | string | 响应消息 |
| data | object | 响应数据 |

**405**: Method Not Allowed

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 状态码 200-成功 400-参数错误 500-接口异常 |
| msg | string | 响应消息 |
| data | object | 响应数据 |

---

### POST /file

**创建文件**

创建文件，不支持批量创建！

#### Request Body

| 字段 | 类型 | 说明 |
|------|------|------|
| name | string | 文件夹名称，仅支持中文、字母、数字、下划线（_）和连字符（-），最大长度63 |
| alias | string | 文件别名，最大长度63字符，允许字符包括英文、数字、下划线。为空则系统自动生成 |
| displayName | string | 文件显示名，最大长度128字符 |
| parentAlias | string | 父级文件夹别名，为空表示顶级 |
| dataType | integer | 1-时序，2-关系，3-实时计算（仅支持函数计算方式），6-聚合，7-引用。 |
| description | string | 文件描述 |
| definition | array<object> | 字段定义，dataType为：1、2、3时必填 |
| definition[].name | string | 字段名：字母开头，支持字母、数字和下划线 最长63 |
| definition[].type | string | 字段类型：INTEGER, LONG, FLOAT, DOUBLE, BOOLEAN, DATETIME, STRING |
| definition[].unique | boolean | 是否唯一约束 |
| definition[].displayName | string | 显示名 |
| definition[].remark | string | 备注 |
| definition[].maxLen | integer | 最大长度(string字段类型生效) |
| definition[].unit | string | 位号单位 |
| definition[].upperLimit | number | 原始上限 |
| definition[].lowerLimit | number | 原始下限 |
| definition[].decimal | integer | 小数精度位数 |
| persistence | boolean | 是否持久化 默认false |
| refers | array<object> | 引用对象 当dataType为计算、聚合、引用时必填 |
| refers[].alias | string | 引用的文件别名 |
| refers[].field | string | 引用的字段 当dataType为计算时，必填 |
| refers[].variableName | string | 计算文件使用的变量名，按a1、a2依次顺延 |
| expression | string | 当dataType=3时可指定表达式，a1表示refers中第一个，a2表示第二个，以此类推。允许为空或无该字段，表示暂无表达式，此时可按照1-时序的特性来处理。 |
| frequency | string | 聚合计算频率：当聚合类型时(dataType=6)的计算时间间隔，单位支持：秒:s 分钟:m 小时：h；如三分钟：3m |
| extendProperties | object | 文件扩展Attributes 最大支持3个 |
| extendProperties.k1 | string |  |
| extendProperties.k2 | string |  |
| templateAlias | string | 关联的模板别名 |
| labelNames | array<string> | 标签名称数组，支持创建文件时打标签 |
#### Responses

**200**: OK

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 状态码 200-成功 400-参数错误 500-接口异常 |
| msg | string | 响应消息 |
| data | object | 响应数据 |

**400**: Bad Request

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 状态码 200-成功 400-参数错误 500-接口异常 |
| msg | string | 响应消息 |
| data | object | 响应数据 |

**405**: Method Not Allowed

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 状态码 200-成功 400-参数错误 500-接口异常 |
| msg | string | 响应消息 |
| data | object | 响应数据 |

---

### POST /folder

**创建文件夹**

创建文件夹信息，不支持批量创建!

#### Request Body

| 字段 | 类型 | 说明 |
|------|------|------|
| name | string | 文件夹名称，仅支持中文、字母、数字、下划线（_）和连字符（-），最大长度63 |
| alias | string | 文件夹别名，仅支持字母、数字、下划线（_），不能以数字开头，最大长度63。为空时系统自动生成 |
| displayName | string | 文件夹显示名称，最大长度128 |
| parentAlias | string | 父级文件夹别名，为空表示顶级 |
| description | string | 文件夹描述，最大长度255 |
| definition | array<object> | 字段定义 |
| definition[].name | string | 字段名：字母开头，支持字母、数字和下划线 最长63 |
| definition[].type | string | 字段类型：INTEGER, LONG, FLOAT, DOUBLE, BOOLEAN, DATETIME, STRING |
| definition[].displayName | string | 显示名 |
| definition[].remark | string | 备注 |
| definition[].maxLen | integer (int32) | 最大长度(string字段类型生效) |
| extendProperties | object | 扩展属性 json键值对，最大支持3个 |
| templateAlias | string | 关联的模板别名 |
#### Responses

**200**: OK

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 状态码 200-成功 400-参数错误 500-接口异常 |
| msg | string | 响应消息 |
| data | object | 响应数据 |

**400**: Bad Request

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 状态码 200-成功 400-参数错误 500-接口异常 |
| msg | string | 响应消息 |
| data | object | 响应数据 |

**405**: Method Not Allowed

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 状态码 200-成功 400-参数错误 500-接口异常 |
| msg | string | 响应消息 |
| data | object | 响应数据 |

---

### PUT /file/detail/{alias}

**修改文件**

修改文件信息

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| alias | path | string | 是 |  |

#### Request Body

| 字段 | 类型 | 说明 |
|------|------|------|
| definition | array<object> | 字段定义 |
| definition[].name | string | 字段名：字母开头，支持字母、数字和下划线 最长63 |
| definition[].type | string | 字段类型：INTEGER, LONG, FLOAT, DOUBLE, BOOLEAN, DATETIME, STRING |
| definition[].displayName | string | 显示名 |
| definition[].remark | string | 备注 |
| definition[].maxLen | integer (int32) | 最大长度(string字段类型生效) |
| definition[].unit | string | 位号单位 |
| definition[].upperLimit | number | 里程上限 |
| definition[].lowerLimit | number | 里程下限 |
| definition[].decimal | integer | 小数精度位数 |
| description | string | 描述 最长255 |
| persistence | boolean | 是否持久化 |
| expression | string | 当dataType=3时可指定表达式，a1表示refers中第一个，a2表示第二个，以此类推。允许为空或无该字段，表示暂无表达式，此时可按照1-时序的特性来处理。 |
| frequency | string | 聚合计算频率：当聚合类型时(dataType=6)的计算时间间隔，单位支持：秒:s 分钟:m 小时：h；如三分钟：3m |
| refers | array<object> | 引用对象 |
| refers[].alias | string | 引用的文件别名 |
| refers[].field | string | 引用的字段  当dataType为计算时，必填 |
| name | string | 文件夹名称，仅支持中文、字母、数字、下划线（_）和连字符（-），最大长度63 |
| displayName | string | 显示名 最长128 |
| extendProperties | object | 扩展属性 最多3个 |
#### Responses

**200**: OK

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 状态码 200-成功 400-参数错误 500-接口异常 |
| msg | string | 响应消息 |
| data | object | 响应数据 |

**400**: Bad Request

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 状态码 200-成功 400-参数错误 500-接口异常 |
| msg | string | 响应消息 |
| data | object | 响应数据 |

**405**: Method Not Allowed

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 状态码 200-成功 400-参数错误 500-接口异常 |
| msg | string | 响应消息 |
| data | object | 响应数据 |

---

### PUT /folder/detail/{alias}

**修改文件夹**

修改文件夹信息

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| alias | path | string | 是 | 别名 |

#### Request Body

| 字段 | 类型 | 说明 |
|------|------|------|
| definition | array<object> | 字段定义 |
| definition[].name | string | 字段名：字母开头，支持字母、数字和下划线 最长63 |
| definition[].type | string | 字段类型：INTEGER, LONG, FLOAT, DOUBLE, BOOLEAN, DATETIME, STRING |
| definition[].displayName | string | 显示名 |
| definition[].remark | string | 备注 |
| definition[].maxLen | integer (int32) | 最大长度(string字段类型生效) |
| description | string | 模型描述 最长255 |
| name | string | 名称 最长63 |
| displayName | string | 显示名 最长128 |
| extendProperties | object | 扩展属性 最多3个 |
#### Responses

**200**: OK

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 状态码 200-成功 400-参数错误 500-接口异常 |
| msg | string | 响应消息 |
| data | object | 响应数据 |

**400**: Bad Request

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 状态码 200-成功 400-参数错误 500-接口异常 |
| msg | string | 响应消息 |
| data | object | 响应数据 |

**405**: Method Not Allowed

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 状态码 200-成功 400-参数错误 500-接口异常 |
| msg | string | 响应消息 |
| data | object | 响应数据 |

---

### POST /condition/tree

**分页查询树结构**

根据条件分页查询uns ,懒加载模式，返回单层层级！

#### Request Body

| 字段 | 类型 | 说明 |
|------|------|------|
| pageNo | integer (int64) | 当前页数，默认为1 |
| pageSize | integer (int64) | 每页记录数，默认为20，最大支持1000 |
| searchType | integer (int32) | 查询类型：1-文本 2-含标签 3-含模板 |
| keyword | string | 搜索关键字：路径名称或别名 |
| dataType | integer | 数据类型：1--时序，2--关系，3--计算型, 6--聚合 7--引用 |
| parentId | integer | 父级ID  可为空，传0查询顶级节点，空值时查询所有 |
#### Responses

**200**: OK

| 字段 | 类型 | 说明 |
|------|------|------|
| pageNo | integer (int64) | 当前页数 |
| pageSize | integer (int64) | 每页记录数 |
| total | integer (int64) |  |
| code | integer (int64) |  |
| data | array<object> |  |
| data[].id | string | ID |
| data[].alias | string | 别名 |
| data[].parentId | string | 目录ID |
| data[].parentAlias | string | 目录别名 |
| data[].pathType | integer (int32) | 路径类型: 0--文件夹，2--文件 |
| data[].name | string | 名称 |
| data[].path | string | 树的路径（全路径） |
| data[].pathName | string | 文件路径名 |
| data[].countChildren | integer (int32) | 子节点数(文件) |
| data[].hasChildren | boolean | 当前节点下是否有子的文件夹 |

**400**: Bad Request

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 状态码 200-成功 400-参数错误 500-接口异常 |
| msg | string | 响应消息 |
| data | object | 响应数据 |

**405**: Method Not Allowed

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 状态码 200-成功 400-参数错误 500-接口异常 |
| msg | string | 响应消息 |
| data | object | 响应数据 |

---

### POST /condition/pageList

**分页查询文件列表**

根据条件分页查询文件信息，列表返回

#### Request Body

| 字段 | 类型 | 说明 |
|------|------|------|
| pageNo | integer (int64) | 当前页数，默认为1 |
| pageSize | integer (int64) | 每页记录数，默认为20，最大支持1000 |
| parentId | integer | 父级ID  可为空，传0查询顶级节点，空值时查询所有 |
| pathType | string | 路径类型 0--文件夹，2--文件 |
| keyword | string | 搜索关键字：路径名称或别名 |
| dataType | array<string> | 数据类型：1--时序，2--关系，3--计算型, 6--聚合 7--引用  支持多选 |
| persistence | boolean | 是否持久化 |
| includeAllChild | boolean | 查询是否包括所有子节点 默认false （当前节点）,需和parentId参数一起使用 |
#### Responses

**200**: OK

| 字段 | 类型 | 说明 |
|------|------|------|
| pageNo | integer (int64) | 当前页数 |
| pageSize | integer (int64) | 每页记录数 |
| total | integer (int64) | 总记录数 |
| code | integer (int64) |  |
| data | array<object> | 接口数据 |
| data[].id | string | ID |
| data[].name | string | 名称 |
| data[].alias | string | 别名 |
| data[].displayName | string | 显示名称 |
| data[].path | string | 路径 |
| data[].dataType | number | 数据类型：1--时序，2--关系，3--计算型, 6--聚合 7--引用 |
| data[].description | string | 描述 |
| data[].pathType | integer (int32) | 路径类型: 0--文件夹，2--文件 |
| data[].updateTime | number | 更新时间--单位：毫秒 |
| data[].createTime | number | 创建时间--单位：毫秒 |

**400**: Bad Request

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 状态码 200-成功 400-参数错误 500-接口异常 |
| msg | string | 响应消息 |
| data | object | 响应数据 |

**405**: Method Not Allowed

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 状态码 200-成功 400-参数错误 500-接口异常 |
| msg | string | 响应消息 |
| data | object | 响应数据 |

---

### POST /file/definition/batch

**批量查询文件属性信息**

根据文件属性支持批量查询文件属性信息！

#### Request Body

| 字段 | 类型 | 说明 |
|------|------|------|
| definitionKey | object | 待查询的definition集合 ，精确匹配查询。支持：文件别名.definition名称   文件namespace.definition名称 |
#### Responses

**200**: OK

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误码，0--正常，其他失败 |
| msg | string | 错误信息 |
| data | array<fileDefinition> |  |
| data[].key | string | 文件属性名称 |
| data[].type | string | 文件属性类型 |
| data[].length | integer | 文件属性长度 |
| data[].displayName | string | 文件属性显示名称 |
| data[].remark | string | 文件属性备注 |
| data[].unit | string | 文件属性单位 |
| data[].upperLimit | number | 文件属性量程上限 |
| data[].lowerLimit | number | 文件属性量程下限 |
| data[].decimal | integer | 文件属性小数位数 |
| data[].fileName | string | 所属文件名称 |
| data[].fileDisplayName | string | 所属文件显示名称 |
| data[].fileDescription | string | 所属文件描述 |
| data[].fileNameSpace | string | 所属文件命名空间 |
| data[].readWriteMode | string | 所属读写模式 READ_ONLY-只读 READ_WRITE-读写 |

**400**: Bad Request

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 状态码 200-成功 400-参数错误 500-接口异常 |
| msg | string | 响应消息 |
| data | object | 响应数据 |

**405**: Method Not Allowed

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 状态码 200-成功 400-参数错误 500-接口异常 |
| msg | string | 响应消息 |
| data | object | 响应数据 |

---

### GET /file/definition

**根据关键字查询文件属性信息**

根据条件查询文件属性信息

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| pageNo | query | integer | 否 | 当前页 默认1 |
| pageSize | query | integer | 否 | 分页 每页条数 默认10 |
| keyword | query | string | 是 | 根据 属性的key、displayName 进行关键字模糊查询 |
| mountType | query | array<string> | 否 | 文件挂载方式 ，支持多选  
0--非挂载（uns 创建） 
10-采集器 11-视频采集器 12-时序库连接器 13-GRPC网关 14-IOT网关（MQTT） 15-模拟采集器
50-消息队列 
60-IT 接口 
70-数据库 |
| dataType | query | array<string> | 否 | 数据类型，支持多选   
         1, // 时序类
         2, // 关系类
         3, // 实时计算类型（表达式计算）
         6, // 聚合类型
         7  // 引用类型 |
| subscribeEnable | query | boolean | 否 | 是否订阅 |

#### Responses

**200**: OK

| 字段 | 类型 | 说明 |
|------|------|------|
| pageNo | integer (int64) | 当前页数 |
| pageSize | integer (int64) | 每页记录数 |
| total | integer (int64) |  |
| code | integer (int64) |  |
| data | array<fileDefinition> |  |
| data[].key | string | 文件属性名称 |
| data[].type | string | 文件属性类型 |
| data[].length | integer | 文件属性长度 |
| data[].displayName | string | 文件属性显示名称 |
| data[].remark | string | 文件属性备注 |
| data[].unit | string | 文件属性单位 |
| data[].upperLimit | number | 文件属性量程上限 |
| data[].lowerLimit | number | 文件属性量程下限 |
| data[].decimal | integer | 文件属性小数位数 |
| data[].fileName | string | 所属文件名称 |
| data[].fileDisplayName | string | 所属文件显示名称 |
| data[].fileDescription | string | 所属文件描述 |
| data[].fileNameSpace | string | 所属文件命名空间 |
| data[].readWriteMode | string | 所属读写模式 READ_ONLY-只读 READ_WRITE-读写 |

**400**: Bad Request

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 状态码 200-成功 400-参数错误 500-接口异常 |
| msg | string | 响应消息 |
| data | object | 响应数据 |

**405**: Method Not Allowed

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 状态码 200-成功 400-参数错误 500-接口异常 |
| msg | string | 响应消息 |
| data | object | 响应数据 |

---

### DELETE /batch/alias

**批量删除文件夹/文件**

#### Request Body

| 字段 | 类型 | 说明 |
|------|------|------|
| aliasList | array<string> | 需要删除的文件或文件夹别名列表
 |
#### Responses

**200**: OK

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 状态码 200-成功 400-参数错误 500-接口异常 |
| msg | string | 响应消息 |
| data | object | 响应数据 |

**400**: Bad Request

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 状态码 200-成功 400-参数错误 500-接口异常 |
| msg | string | 响应消息 |
| data | object | 响应数据 |

**405**: Method Not Allowed

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 状态码 200-成功 400-参数错误 500-接口异常 |
| msg | string | 响应消息 |
| data | object | 响应数据 |

---


## 模板管理

### GET /template/{alias}

**查询模板详情**

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| alias | path | string | 是 | 别名 |

#### Responses

**200**: OK

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 状态码200成功  其他失败 |
| msg | string | 提示消息 |
| data | TemplateVo |  |
| data.id | integer (int64) | 模板ID |
| data.name | string | 模板名称 |
| data.alias | string | 别名 |
| data.definition | array<FieldDefine> | 字段定义 |
| data.definition[].name | string | 字段名：字母开头，支持字母、数字和下划线，最长63 |
| data.definition[].type | string | 字段类型：INTEGER, LONG, FLOAT, DOUBLE, BOOLEAN, DATETIME, STRING |
| data.definition[].unique | boolean | 是否唯一约束，新建模板时，此参数不生效 |
| data.definition[].index | string | 对应的协议字段key，新建模板时，此参数不生效 |
| data.definition[].displayName | string | 显示名 |
| data.definition[].remark | string | 备注 |
| data.definition[].maxLen | integer (int32) | 最大长度(string字段类型生效) |
| data.definition[].systemField | boolean | 是否系统参数，新建模板时，此参数不生效 |
| data.definition[].unit | string | 位号单位 最长5 |
| data.definition[].upperLimit | number | 里程上限 |
| data.definition[].lowerLimit | number | 里程下限 |
| data.definition[].decimal | integer | 小数精度位数 |
| data.createTime | integer (int64) | 创建时间--单位：毫秒 |
| data.description | string | 模型描述 |

**400**: Bad Request

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 状态码 200-成功 400-参数错误 500-接口异常 |
| msg | string | 响应消息 |
| data | TemplateVo |  |
| data.id | integer (int64) | 模板ID |
| data.name | string | 模板名称 |
| data.alias | string | 别名 |
| data.definition | array<FieldDefine> | 字段定义 |
| data.definition[].name | string | 字段名：字母开头，支持字母、数字和下划线，最长63 |
| data.definition[].type | string | 字段类型：INTEGER, LONG, FLOAT, DOUBLE, BOOLEAN, DATETIME, STRING |
| data.definition[].unique | boolean | 是否唯一约束，新建模板时，此参数不生效 |
| data.definition[].index | string | 对应的协议字段key，新建模板时，此参数不生效 |
| data.definition[].displayName | string | 显示名 |
| data.definition[].remark | string | 备注 |
| data.definition[].maxLen | integer (int32) | 最大长度(string字段类型生效) |
| data.definition[].systemField | boolean | 是否系统参数，新建模板时，此参数不生效 |
| data.definition[].unit | string | 位号单位 最长5 |
| data.definition[].upperLimit | number | 里程上限 |
| data.definition[].lowerLimit | number | 里程下限 |
| data.definition[].decimal | integer | 小数精度位数 |
| data.createTime | integer (int64) | 创建时间--单位：毫秒 |
| data.description | string | 模型描述 |

**405**: Method Not Allowed

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 状态码 200-成功 400-参数错误 500-接口异常 |
| msg | string | 响应消息 |
| data | object | 响应数据 |

---

### PUT /template/{alias}

**修改模板**

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| alias | path | string | 是 |  |

#### Request Body

| 字段 | 类型 | 说明 |
|------|------|------|
| name | string | 模板名称，最长63 |
| description | string | 模板描述 最长255 |
| definition | array<object> | 字段定义 |
| definition[].name | string | 字段名：字母开头，支持字母、数字和下划线，最长63 |
| definition[].type | string | 字段类型：INTEGER, LONG, FLOAT, DOUBLE, BOOLEAN, DATETIME, STRING |
| definition[].displayName | string | 显示名 |
| definition[].remark | string | 备注 |
| definition[].maxLen | integer (int32) | 最大长度(string字段类型生效) |
#### Responses

**200**: OK

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 状态码 200-成功 400-参数错误 500-接口异常 |
| msg | string | 响应消息 |
| data | object | 响应数据 |

**400**: Bad Request

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 状态码 200-成功 400-参数错误 500-接口异常 |
| msg | string | 响应消息 |
| data | object | 响应数据 |

**405**: Method Not Allowed

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 状态码 200-成功 400-参数错误 500-接口异常 |
| msg | string | 响应消息 |
| data | object | 响应数据 |

---

### DELETE /template/{alias}

**删除模板**

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| alias | path | string | 是 | 模板别名 |

#### Responses

**200**: OK

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 状态码 200-成功 400-参数错误 500-接口异常 |
| msg | string | 响应消息 |
| data | object | 响应数据 |

**400**: Bad Request

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 状态码 200-成功 400-参数错误 500-接口异常 |
| msg | string | 响应消息 |
| data | object | 响应数据 |

**405**: Method Not Allowed

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 状态码 200-成功 400-参数错误 500-接口异常 |
| msg | string | 响应消息 |
| data | object | 响应数据 |

---

### GET /template/schema

**查询模版schema 元数据结构**

文件夹schema 定义结构

#### Responses

**200**: 

*无定义*


---

### GET /template

**查询模板列表**

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| pageNo | query | integer | 是 | 当前页数 |
| pageSize | query | integer | 是 | 每页记录数，默认为20，最大支持1000 |
| key | query | string | 否 | 关键字查询，模版名称模糊匹配 |

#### Responses

**200**: OK

| 字段 | 类型 | 说明 |
|------|------|------|
| pageNo | integer (int64) | 当前页数 |
| pageSize | integer (int64) | 每页记录数 |
| total | integer (int64) | 总记录数 |
| code | integer (int64) |  |
| data | array<object> |  |
| data[].id | string | 模板ID |
| data[].name | string | 模板名称 |
| data[].description | string | 模型描述 |
| data[].alias | string | 别名 |

**400**: Bad Request

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 状态码 200-成功 400-参数错误 500-接口异常 |
| msg | string | 响应消息 |
| data | object | 响应数据 |

**405**: Method Not Allowed

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 状态码 200-成功 400-参数错误 500-接口异常 |
| msg | string | 响应消息 |
| data | object | 响应数据 |

---

### POST /template

**新增模板**

#### Request Body

| 字段 | 类型 | 说明 |
|------|------|------|
| alias | string | 别名，唯一，最长63，可用字符：a-zA-Z1-9_ |
| name | string | 模板名称，最长63 |
| definition | array<object> | 字段定义 |
| definition[].name | string | 字段名：字母开头，支持字母、数字和下划线，最长63 |
| definition[].type | string | 字段类型：INTEGER, LONG, FLOAT, DOUBLE, BOOLEAN, DATETIME, STRING |
| definition[].displayName | string | 显示名 |
| definition[].remark | string | 备注 |
| definition[].maxLen | integer (int32) | 最大长度(string字段类型生效) |
| description | string | 模板描述 最长255 |
#### Responses

**200**: OK

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| msg | string |  |
| data | string |  |

**400**: Bad Request

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 状态码 200-成功 400-参数错误 500-接口异常 |
| msg | string | 响应消息 |
| data | object | 响应数据 |

**405**: Method Not Allowed

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 状态码 200-成功 400-参数错误 500-接口异常 |
| msg | string | 响应消息 |
| data | object | 响应数据 |

---


## 标签管理

### GET /label/schema

**查询标签schema 元数据结构**

文件夹schema 定义结构

#### Responses

**200**: 

*无定义*


---

### GET /label

**查询标签列表**

列出所有支持的标签，下拉选择，支持模糊搜索

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| pageNo | query | string | 是 | 当前页数 |
| pageSize | query | integer | 是 | 每页记录数，默认为20，最大支持1000 |
| key | query | string | 否 | 标签名称查询，支持模糊匹配 |

#### Responses

**200**: OK

| 字段 | 类型 | 说明 |
|------|------|------|
| pageNo | string | 当前页 |
| pageSize | string | 每页记录数 |
| total | string | 总记录数 |
| code | integer (int32) |  |
| msg | string |  |
| data | array<object> | 标签数据 |
| data[].id | integer (int64) | 标签ID |
| data[].labelName | string | 标签名称 |
| data[].createTime | number | 创建时间--单位：毫秒 |

**400**: Bad Request

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 状态码 200-成功 400-参数错误 500-接口异常 |
| msg | string | 响应消息 |
| data | object | 响应数据 |

**405**: Method Not Allowed

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 状态码 200-成功 400-参数错误 500-接口异常 |
| msg | string | 响应消息 |
| data | object | 响应数据 |

---

### POST /label

**创建标签**

#### Request Body

| 字段 | 类型 | 说明 |
|------|------|------|
| labelName | string | 标签名称 名称仅支持中文、字母、数字、下划线（_）和连字符（-）最长63 |
#### Responses

**200**: OK

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 状态码 200-成功 400-参数错误 500-接口异常 |
| msg | string | 响应消息 |
| data | object | 响应数据 |
| data.id | string | 标签ID |
| data.labelName | string | 标签名称 |
| data.createTime | number | 创建时间--单位：毫秒 |

**400**: Bad Request

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 状态码 200-成功 400-参数错误 500-接口异常 |
| msg | string | 响应消息 |
| data | object | 响应数据 |

**405**: Method Not Allowed

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 状态码 200-成功 400-参数错误 500-接口异常 |
| msg | string | 响应消息 |
| data | object | 响应数据 |

---

### GET /label/{id}

**查询标签详情**

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| id | path | string | 是 |  |

#### Responses

**200**: OK

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| msg | string |  |
| data | object |  |
| data.id | string | 标签ID |
| data.labelName | string | 标签名称 |
| data.createTime | number | 创建时间--单位：毫秒 |

**400**: Bad Request

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 状态码 200-成功 400-参数错误 500-接口异常 |
| msg | string | 响应消息 |
| data | object | 响应数据 |
| data.id | integer | 标签ID |
| data.labelName | string | 标签名称 |
| data.createAt | integer | 创建时间 |

**405**: Method Not Allowed

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 状态码 200-成功 400-参数错误 500-接口异常 |
| msg | string | 响应消息 |
| data | object | 响应数据 |

---

### PUT /label/{id}

**修改标签**

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| id | path | string | 是 | 标签ID |

#### Request Body

| 字段 | 类型 | 说明 |
|------|------|------|
| labelName | string | 标签名称 名称仅支持中文、字母、数字、下划线（_）和连字符（-）最长63 |
#### Responses

**200**: OK

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 状态码 200-成功 400-参数错误 500-接口异常 |
| msg | string | 响应消息 |
| data | object | 响应数据 |

**400**: Bad Request

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 状态码 200-成功 400-参数错误 500-接口异常 |
| msg | string | 响应消息 |
| data | object | 响应数据 |

**405**: Method Not Allowed

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 状态码 200-成功 400-参数错误 500-接口异常 |
| msg | string | 响应消息 |
| data | object | 响应数据 |

---

### DELETE /label/{id}

**删除标签**

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| id | path | string | 是 | 标签ID |

#### Responses

**200**: OK

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 状态码 200-成功 400-参数错误 500-接口异常 |
| msg | string | 响应消息 |
| data | object | 响应数据 |

**400**: Bad Request

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 状态码 200-成功 400-参数错误 500-接口异常 |
| msg | string | 响应消息 |
| data | object | 响应数据 |

**405**: Method Not Allowed

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 状态码 200-成功 400-参数错误 500-接口异常 |
| msg | string | 响应消息 |
| data | object | 响应数据 |

---

### POST /batch/makeLabel

**批量文件打标签**

#### Request Body

*无定义*

#### Responses

**200**: OK

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 状态码 200-成功 400-参数错误 500-接口异常 |
| msg | string | 响应消息 |
| data | object | 响应数据 |

**400**: Bad Request

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 状态码 200-成功 400-参数错误 500-接口异常 |
| msg | string | 响应消息 |
| data | object | 响应数据 |

**405**: Method Not Allowed

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 状态码 200-成功 400-参数错误 500-接口异常 |
| msg | string | 响应消息 |
| data | object | 响应数据 |

---

### PUT /cancelLabel/{alias}

**文件取消标签**

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| alias | path | string | 是 | 文件别名 |

#### Request Body

*无定义*

#### Responses

**200**: 

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 状态码 200-成功 400-参数错误 500-接口异常 |
| msg | string | 响应消息 |
| data | object | 响应数据 |

---


## 实时服务

### POST /realtime/v3/read

**批量读当前值**

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|

#### Request Body

| 字段 | 类型 | 说明 |
|------|------|------|
| timestampPrecision | TimestampPrecision | 时间精度，此参数作用于本次请求或者响应中的数据时间戳，与其他时间参数如超时时间、采样间隔等无关。可选[s:秒， ms:毫秒， us:微秒]，默认毫秒 |
| objects | array<object> | 用于指定需要查询的「数据对象」及「待返回的属性」，数组中每个元素代表一组查询对象。 结构规则： 1. 数组元素：每个元素是一个 Object，键名为「accessId」（数据对象的唯一标识），键值为「属性数组」（指定该对象需返回的属性）。 2. accessId 含义（数据对象标识）：
  - 位号数据：accessId = 位号别名（如 "temp_sensor_1"）；
  - UNS 文件：accessId = 文件路径（如 "data/device_01.uns"）；
  - 结构化对象属性：accessId = 「对象路径.属性名」（如 "temp_sensor_1.current_value"）；
3. 属性数组规则（指定需返回的属性）：
  - 空数组 []：返回该 accessId 对应的「所有属性」；
  - ["*"]：效果同空数组，返回所有属性；
  - 具体属性名（如 ["power", "electric"]）：仅返回指定的属性； |
#### Responses

**200**: 

| 字段 | 类型 | 说明 |
|------|------|------|
| timestampPrecision | TimestampPrecision | 时间精度，此参数作用于本次请求或者响应中的数据时间戳，与其他时间参数如超时时间、采样间隔等无关。可选[s:秒， ms:毫秒， us:微秒]，默认毫秒 |
| code | Code | 0 表示成功，非0 表示失败。成功时不需要判断objects中的内容，如果失败，objects中有所有失败的信息。如果失败，但是objects为空，说明全部失败（请求异常场景）。 |
| message | Message | 请求结果code的文本描述，可用于显示或问题定位 |
| datas | array<NamedValueItem> |  |
| datas[].name | string | 名称标识 |
| datas[].value | ValueItem |  |
| datas[].value.timeStamp | number | 时间戳 |
| datas[].value.status | number | 质量码 |
| datas[].value.value | object | 可选的附加值（任意类型） |

---

### POST /realtime/v3/write

**批量写值**
**⚠️ 强制规则（重要）**

当向 **UNS 节点写数据**时，**无论是“实时点位数据”还是“模拟的关系型/结构化数据”**，
都必须调用这个接口：`POST /realtime/v3/write`。

如果用户让你“插入一条模拟的关系型记录/表数据/工单数据”，也同样要走本接口。
做法是把“表的一行记录”**拆成多个点写入**：每个字段一个点（`datas[].name`），字段值写入
`datas[].value.value`。

#### ✅ 关系型/结构化数据的写入方式（示例）

假设要在 UNS 下模拟一张表 `table1` 的一条记录，字段如下：
- id (LONG)
- work_order_code (STRING)
- alarm_record_id (LONG)
- alarm_status (INT)

把这一行记录拆成 4 个写入点（每个字段一个点）：
- `table1.id` = 1
- `table1.work_order_code` = `"AROrder20260331MOCK"`
- `table1.alarm_record_id` = 0
- `table1.alarm_status` = 1

调用内置工具 `supos_api_call`（推荐用毫秒时间戳；`status` 可省略或用 0）：

```text
method: post
path: /os/open-api/realtime/v3/write
data: {
  "timestampPrecision": "ms",
  "datas": [
    { "name": "table1.id", "value": { "timeStamp": 1711872000000, "status": 0, "value": 1 } },
    { "name": "table1.work_order_code", "value": { "timeStamp": 1711872000000, "status": 0, "value": "AROrder20260331MOCK" } },
    { "name": "table1.alarm_record_id", "value": { "timeStamp": 1711872000000, "status": 0, "value": 0 } },
    { "name": "table1.alarm_status", "value": { "timeStamp": 1711872000000, "status": 0, "value": 1 } }
  ]
}
```

#### ✅ 实时点位数据的写入方式（示例）

例如写入一个实时温度点：

```text
method: post
path: /os/open-api/realtime/v3/write
data: {
  "timestampPrecision": "ms",
  "datas": [
    { "name": "factory.device_01.temperature", "value": { "timeStamp": 1711872000000, "status": 0, "value": 36.8 } }
  ]
}
```

> 结论：**只要是“写 UNS 节点数据”这个动作，就统一用 `/realtime/v3/write`。**

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|

#### Request Body

| 字段 | 类型 | 说明 |
|------|------|------|
| timestampPrecision | TimestampPrecision | 时间精度，此参数作用于本次请求或者响应中的数据时间戳，与其他时间参数如超时时间、采样间隔等无关。可选[s:秒， ms:毫秒， us:微秒]，默认毫秒 |
| datas | array<NamedValueItem> |  |
| datas[].name | string | 名称标识 |
| datas[].value | ValueItem |  |
| datas[].value.timeStamp | number | 时间戳 |
| datas[].value.status | number | 质量码 |
| datas[].value.value | object | 可选的附加值（任意类型） |
#### Responses

**200**: 

| 字段 | 类型 | 说明 |
|------|------|------|
| message | Message | 请求结果code的文本描述，可用于显示或问题定位 |
| code | Code | 0 表示成功，非0 表示失败。成功时不需要判断objects中的内容，如果失败，objects中有所有失败的信息。如果失败，但是objects为空，说明全部失败（请求异常场景）。 |
| objects | array<object> | 用于返回查询的「数据对象」及「待返回的属性」的结果，数组中每个元素代表一组查询失败的对象。 |
| objects[].name | Name | 设备位号别名、设备位号路径、文件别名、文件路径或文件的某个属性 |
| objects[].code | Code | 0 表示成功，非0 表示失败。成功时不需要判断objects中的内容，如果失败，objects中有所有失败的信息。如果失败，但是objects为空，说明全部失败（请求异常场景）。 |

---


## 历史服务

### POST /history/v3/aggregation

**聚合查询**

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|

#### Request Body

| 字段 | 类型 | 说明 |
|------|------|------|
| timeOffset | number | 时间窗口偏移，单位是微秒。比如，查询开始时间2025-08-01T00:00:00Z，统计间隔为10分钟，在没有指定时间偏移时，统计周期依次为["2025-08-01T00:00:00Z", "2025-08-01T00:10:00Z")，["2025-08-01T00:10:00Z", "2025-08-01T00:20:00Z")... 如指定时间偏移1分钟（60000000），则统计周期依次["2025-08-01T00:01:00Z", "2025-08-01T00:11:00Z")，["2025-08-01T00:11:00Z", "2025-08-01T00:21:00Z") ... 需要注意，统计的结束时间是不会偏移的，这一般意味着最后一个区间的时间会少于之前的区间。 |
| queryTimes | array<string> | 查询的起止时间段，采用ISO8601标准的字符串，比如"2025-08-25T10:00:00Z"或者"2025-08-25T18:00:00+08:00"。当前不支持指定时间边界是否含，总是默认前闭后开。 |
| objects | array<object> | 用于指定需要查询的「数据对象」及「待返回的属性」，数组中每个元素代表一组查询对象。 结构规则： 1. 数组元素：每个元素是一个 Object，键名为「accessId」（数据对象的唯一标识），键值为「属性数组」（指定该对象需返回的属性）。 2. accessId 含义（数据对象标识）：
  - 位号数据：accessId = 位号别名（如 "temp_sensor_1"）；
  - UNS 文件：accessId = 文件路径（如 "data/device_01.uns"）；
  - 结构化对象属性：accessId = 「对象路径.属性名」（如 "temp_sensor_1.current_value"）；
3. 属性数组规则（指定需返回的属性）：
  - 空数组 []：返回该 accessId 对应的「所有属性」；
  - ["*"]：效果同空数组，返回所有属性；
  - 具体属性名（如 ["power", "electric"]）：仅返回指定的属性； |
| timestampPrecision | TimestampPrecision | 时间精度，此参数作用于本次请求或者响应中的数据时间戳，与其他时间参数如超时时间、采样间隔等无关。可选[s:秒， ms:毫秒， us:微秒]，默认毫秒 |
| reverse | Reverse | 用于查询结果按时间戳的排序：0(默认值) - 按时间戳升序；1 - 按时间戳降序 |
| interpolation | Interpolation | 插值策略:0(默认值) - 前值; 2 - 线性插值 |
| interval | Interval | 采样/统计间隔，时间精度是微秒 |
| badStrategy | object | 对于bad数据的处理策略。1 - 过滤bad点; 2 - 使用前一个好值; 3 - 当前区间计算终止，结果为bad |
| method | array<string> | 聚合的方法，数组，支持指定多个，如["first", "max"],first：区间第一个值;max：区间内最大值 |
| dataCount | DataCount | 期望获得结果的数量。一次请求中，最多支持10万数据。批量查询时，则平均至单个位号或文件属性。 |
| timeOut | TimeOut | 请求超时时间, 请求超时时间, 默认是微秒 |
#### Responses

**200**: 

| 字段 | 类型 | 说明 |
|------|------|------|
| message | Message | 请求结果code的文本描述，可用于显示或问题定位 |
| code | Code | 0 表示成功，非0 表示失败。成功时不需要判断objects中的内容，如果失败，objects中有所有失败的信息。如果失败，但是objects为空，说明全部失败（请求异常场景）。 |
| datas | array<object> |  |
| datas[].name | Name | 设备位号别名、设备位号路径、文件别名、文件路径或文件的某个属性 |
| datas[].code | Code | 0 表示成功，非0 表示失败。成功时不需要判断objects中的内容，如果失败，objects中有所有失败的信息。如果失败，但是objects为空，说明全部失败（请求异常场景）。 |
| datas[].resultType | ResultType | 当前结果对应的聚合方法(仅聚合) |
| datas[].values | array<NamedValuesItem> |  |
| datas[].values[].name | string | 名称标识 |
| datas[].values[].values | array<ValueItem> |  |
| datas[].values[].values[].timeStamp | number | 时间戳 |
| datas[].values[].values[].status | number | 质量码 |
| datas[].values[].values[].value | object | 可选的附加值（任意类型） |

---

### POST /history/v3/sample

**采样值查询**

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|

#### Request Body

| 字段 | 类型 | 说明 |
|------|------|------|
| queryTimes | array<string> | 查询的起止时间段，采用ISO8601标准的字符串，比如"2025-08-25T10:00:00Z"或者"2025-08-25T18:00:00+08:00"。 采样查询是包含边界的，即前闭后闭。 有两类方式: 1. 两个时间，即开始时间和结束时间，根据采样间隔计算采样点。这里时间了可以相同，表示对某一时刻的采样，dataCount指定为1. 2. 两个以上的时间，这意味着指定了需要采样的时间点，此时无需在指定interval、datacount了。 |
| objects | array<object> | 用于指定需要查询的「数据对象」及「待返回的属性」，数组中每个元素代表一组查询对象。 结构规则： 1. 数组元素：每个元素是一个 Object，键名为「accessId」（数据对象的唯一标识），键值为「属性数组」（指定该对象需返回的属性）。 2. accessId 含义（数据对象标识）：
  - 位号数据：accessId = 位号别名（如 "temp_sensor_1"）；
  - UNS 文件：accessId = 文件路径（如 "data/device_01.uns"）；
  - 结构化对象属性：accessId = 「对象路径.属性名」（如 "temp_sensor_1.current_value"）；
3. 属性数组规则（指定需返回的属性）：
  - 空数组 []：返回该 accessId 对应的「所有属性」；
  - ["*"]：效果同空数组，返回所有属性；
  - 具体属性名（如 ["power", "electric"]）：仅返回指定的属性； |
| timestampPrecision | TimestampPrecision | 时间精度，此参数作用于本次请求或者响应中的数据时间戳，与其他时间参数如超时时间、采样间隔等无关。可选[s:秒， ms:毫秒， us:微秒]，默认毫秒 |
| interval | Interval | 采样/统计间隔，时间精度是微秒 |
| reverse | Reverse | 用于查询结果按时间戳的排序：0(默认值) - 按时间戳升序；1 - 按时间戳降序 |
| interpolation | Interpolation | 插值策略:0(默认值) - 前值; 2 - 线性插值 |
| dataCount | DataCount | 期望获得结果的数量。一次请求中，最多支持10万数据。批量查询时，则平均至单个位号或文件属性。 |
| timeOut | TimeOut | 请求超时时间, 请求超时时间, 默认是微秒 |
#### Responses

**200**: 

| 字段 | 类型 | 说明 |
|------|------|------|
| message | Message | 请求结果code的文本描述，可用于显示或问题定位 |
| code | Code | 0 表示成功，非0 表示失败。成功时不需要判断objects中的内容，如果失败，objects中有所有失败的信息。如果失败，但是objects为空，说明全部失败（请求异常场景）。 |
| datas | array<object> |  |
| datas[].name | Name | 设备位号别名、设备位号路径、文件别名、文件路径或文件的某个属性 |
| datas[].code | Code | 0 表示成功，非0 表示失败。成功时不需要判断objects中的内容，如果失败，objects中有所有失败的信息。如果失败，但是objects为空，说明全部失败（请求异常场景）。 |
| datas[].resultType | ResultType | 当前结果对应的聚合方法(仅聚合) |
| datas[].values | array<NamedValuesItem> |  |
| datas[].values[].name | string | 名称标识 |
| datas[].values[].values | array<ValueItem> |  |
| datas[].values[].values[].timeStamp | number | 时间戳 |
| datas[].values[].values[].status | number | 质量码 |
| datas[].values[].values[].value | object | 可选的附加值（任意类型） |

---

### POST /history/v3/raw

**原始值查询**

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|

#### Request Body

| 字段 | 类型 | 说明 |
|------|------|------|
| dataOffset | number | 结果偏移，一般用作翻页。比如在指定的查询时间段内有1000个数据，界面上每次展示50个，首页dataOffset=0，得到前50个，下一页时即指定dataOffset=50，其余条件仍一样，即可得到51~100，依次类推。这里分页的关键是整体条件不变，仅改变偏移。 |
| queryTimes | array<string> | 查询的起止时间段，采用ISO8601标准的字符串，比如"2025-08-25T10:00:00Z"或者"2025-08-25T18:00:00+08:00"。对于原始查询，其作用为前闭后闭。 |
| objects | array<object> | 用于指定需要查询的「数据对象」及「待返回的属性」，数组中每个元素代表一组查询对象。 结构规则： 1. 数组元素：每个元素是一个 Object，键名为「accessId」（数据对象的唯一标识），键值为「属性数组」（指定该对象需返回的属性）。 2. accessId 含义（数据对象标识）：
  - 位号数据：accessId = 位号别名（如 "temp_sensor_1"）；
  - UNS 文件：accessId = 文件路径（如 "data/device_01.uns"）；
  - 结构化对象属性：accessId = 「对象路径.属性名」（如 "temp_sensor_1.current_value"）；
3. 属性数组规则（指定需返回的属性）：
  - 空数组 []：返回该 accessId 对应的「所有属性」；
  - ["*"]：效果同空数组，返回所有属性；
  - 具体属性名（如 ["power", "electric"]）：仅返回指定的属性； |
| timestampPrecision | TimestampPrecision | 时间精度，此参数作用于本次请求或者响应中的数据时间戳，与其他时间参数如超时时间、采样间隔等无关。可选[s:秒， ms:毫秒， us:微秒]，默认毫秒 |
| repeatedTimestampStrategy | number (0, 1, 2) | 原始数据时间戳重复时的策略：0（默认值）- 返回最后一个。 1 - 返回第一个 2 - 都返回 |
| reverse | Reverse | 用于查询结果按时间戳的排序：0(默认值) - 按时间戳升序；1 - 按时间戳降序 |
| dataSource | number (0, 1) | 在系统运行过程中，除数据源外，采集服务、实时数据服务、存档服务都可能会产生数据，实时数据服务、存档数据在检测到数据源断开和系统退出时会自动存储一个bad点。查询方法提供了数据来源进行过滤的功能：0（默认值）- 所有数据。 1 - 仅数据源数据 |
| valueStrategy | number (0, 1) | 结果中v的策略：该参数仅对lblob类型生效：0（默认值）- 返回vqst。 1 - 返回qst |
| dataCount | DataCount | 期望获得结果的数量。一次请求中，最多支持10万数据。批量查询时，则平均至单个位号或文件属性。 |
| timeOut | TimeOut | 请求超时时间, 请求超时时间, 默认是微秒 |
#### Responses

**200**: 

| 字段 | 类型 | 说明 |
|------|------|------|
| message | Message | 请求结果code的文本描述，可用于显示或问题定位 |
| code | Code | 0 表示成功，非0 表示失败。成功时不需要判断objects中的内容，如果失败，objects中有所有失败的信息。如果失败，但是objects为空，说明全部失败（请求异常场景）。 |
| datas | array<object> |  |
| datas[].name | Name | 设备位号别名、设备位号路径、文件别名、文件路径或文件的某个属性 |
| datas[].code | Code | 0 表示成功，非0 表示失败。成功时不需要判断objects中的内容，如果失败，objects中有所有失败的信息。如果失败，但是objects为空，说明全部失败（请求异常场景）。 |
| datas[].resultType | ResultType | 当前结果对应的聚合方法(仅聚合) |
| datas[].values | array<NamedValuesItem> |  |
| datas[].values[].name | string | 名称标识 |
| datas[].values[].values | array<ValueItem> |  |
| datas[].values[].values[].timeStamp | number | 时间戳 |
| datas[].values[].values[].status | number | 质量码 |
| datas[].values[].values[].value | object | 可选的附加值（任意类型） |

---

