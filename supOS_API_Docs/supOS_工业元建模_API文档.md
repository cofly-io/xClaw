# “工业元”建模(也称为uns，统一命名空间，united namespace)

**版本**: 1.0.0  
**OpenAPI**: 3.0.1

---


## 文件夹/文件管理

### GET /os/open-api/uns/folder/schema

**查询文件夹schema 元数据结构**

文件夹schema 定义结构

#### Responses

**200**: 

*无定义*


---

### GET /os/open-api/uns/file/schema

**查询文件schema 元数据结构**

文件夹schema 定义结构

#### Responses

**200**: 

*无定义*


---

### GET /os/open-api/uns/folder/{alias}

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

### GET /os/open-api/uns/file/{alias}

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

### GET /os/open-api/uns/folder/byPath

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

### GET /os/open-api/uns/file/byPath

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

### POST /os/open-api/uns/file

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

### POST /os/open-api/uns/folder

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

### PUT /os/open-api/uns/file/detail/{alias}

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

### PUT /os/open-api/uns/folder/detail/{alias}

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

### POST /os/open-api/uns/condition/tree

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

### POST /os/open-api/uns/condition/pageList

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

### POST /os/open-api/uns/file/definition/batch

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

### GET /os/open-api/uns/file/definition

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

### DELETE /os/open-api/uns/batch/alias

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

### GET /os/open-api/uns/template/{alias}

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

### PUT /os/open-api/uns/template/{alias}

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

### DELETE /os/open-api/uns/template/{alias}

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

### GET /os/open-api/uns/template/schema

**查询模版schema 元数据结构**

文件夹schema 定义结构

#### Responses

**200**: 

*无定义*


---

### GET /os/open-api/uns/template

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

### POST /os/open-api/uns/template

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

### GET /os/open-api/uns/label/schema

**查询标签schema 元数据结构**

文件夹schema 定义结构

#### Responses

**200**: 

*无定义*


---

### GET /os/open-api/uns/label

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

### POST /os/open-api/uns/label

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

### GET /os/open-api/uns/label/{id}

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

### PUT /os/open-api/uns/label/{id}

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

### DELETE /os/open-api/uns/label/{id}

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

### POST /os/open-api/uns/batch/makeLabel

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

### PUT /os/open-api/uns/cancelLabel/{alias}

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


## Pride

### GET /os/open-api/uns/pride/template/alias

**根据别名查询模板详情**

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| alias | query | string | 否 |  |

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
| data | object | 响应数据 |

**405**: Method Not Allowed

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 状态码 200-成功 400-参数错误 500-接口异常 |
| msg | string | 响应消息 |
| data | object | 响应数据 |

---

### POST /os/open-api/uns/pride/template/pageList

**查询模板列表**

#### Request Body

| 字段 | 类型 | 说明 |
|------|------|------|
| pageNo | integer (int64) | 当前页数，默认为1 |
| pageSize | integer (int64) | 每页记录数，默认为20，最大支持1000 |
| key | string | 搜索关键字 |
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

### POST /os/open-api/uns/pride/task/import

**批量创建（增量）PRIDE拓扑任务**

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| rootAlias | query | string | 否 | 为该拓扑的根文件夹别名，body中的顶层节点应该创建在该目录下 |

#### Request Body

| 字段 | 类型 | 说明 |
|------|------|------|
| instances | array<object> |  |
| instances[].attributeValues | array<object> | 文件夹扩展属性键值对集合,最多三个 |
| instances[].attributeValues[].attributeName | string | 扩展属性键 |
| instances[].attributeValues[].attributeNamespace | string |  |
| instances[].attributeValues[].attributeValue | string | 扩展属性值 |
| instances[].attributes | array<object> | 当前文件夹下文件集合 |
| instances[].attributes[].attributes | array<string> |  |
| instances[].attributes[].bindSourceInstanceEnName | string | 属性所关联的采集器别名 |
| instances[].attributes[].children | array<string> |  |
| instances[].attributes[].dataType | string | 属性值数据类型 |
| instances[].attributes[].defaultValue | string | 属性默认值（初始值），仅针对静态属性 |
| instances[].attributes[].description | string | 属性描述 |
| instances[].attributes[].displayName | string | 属性名称 |
| instances[].attributes[].enName | string | 属性别名 |
| instances[].attributes[].needToCreateBindRelation | boolean | 是否为动态属性（无该字段则或为true时表示动态属性，为false时表示静态属性） |
| instances[].attributes[].templateFullName | string |  |
| instances[].bindSourceInstanceEnName | string | 文件及所对应的采集器别名 |
| instances[].children | array<string> | 子文件夹集合 |
| instances[].description | string | 文件夹描述 |
| instances[].displayName | string | 文件夹名称 |
| instances[].enName | string | 文件夹别名 |
| instances[].templateFullName | string | 文件夹模版别名 |
#### Responses

**200**: OK

| 字段 | 类型 | 说明 |
|------|------|------|
| taskId | string | 任务ID |
| createdTime | string | 任务开始时间 |
| finishedTime | string | 任务结束时间 |
| status | integer | -1:执行失败，0:执行中，1:执行成功 |
| message | string |  |

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

### POST /os/open-api/uns/pride/task/deletion-folders

**批量删除PRIDE拓扑任务**

#### Request Body

*无定义*

#### Responses

**200**: OK

| 字段 | 类型 | 说明 |
|------|------|------|
| taskId | string | 任务ID |
| createdTime | string | 任务开始时间 |
| finishedTime | string | 任务结束时间 |
| status | integer | -1:执行失败，0:执行中，1:执行成功 |
| message | string |  |

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

### POST /os/open-api/uns/pride/task/deletion-files

**批量删除PRIDE属性任务**

#### Request Body

*无定义*

#### Responses

**200**: OK

| 字段 | 类型 | 说明 |
|------|------|------|
| taskId | string | 任务ID |
| createdTime | string | 任务开始时间 |
| finishedTime | string | 任务结束时间 |
| status | integer | -1:执行失败，0:执行中，1:执行成功 |
| message | string |  |

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

### GET /os/open-api/uns/pride/task/query

**任务结果查询**

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| taskId | query | string | 是 | 任务ID |

#### Responses

**200**: OK

| 字段 | 类型 | 说明 |
|------|------|------|
| taskId | string | 任务ID |
| createdTime | string | 任务开始时间 |
| finishedTime | string | 任务结束时间 |
| status | integer | -1:执行失败，0:执行中，1:执行成功 |
| message | string |  |

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

### POST /os/open-api/uns/pride/tree

**查询数据模型树**

只返回文件夹数据

#### Request Body

| 字段 | 类型 | 说明 |
|------|------|------|
| parentId | string | 指定根文件夹ID。如果和parentAlias同时存在，则parentAlias参数输入无效。 |
| parentAlias | string | 指定根文件夹别名。如果为空表示查询全部 |
| returnParentInfo | boolean | 返回数据是否包含parentId/parentAlias中指定的文件夹信息。ture-包含该信息（默认值），false-不包含该信息。 |
| deep | integer | 查询深度。-1为默认值，表示全深度；1表示1层，以此类推。 |
| displayName | string | 指定文件夹显示名称。模糊匹配 |
| templateAlias | string | 指定模版别名。精确匹配 |
| description | string | 文件夹描述。模糊匹配 |
| createStartTime | string | 文件夹创建起始时间。使用RFC3339格式查询。 |
| createEndTime | string | 文件夹创建结束时间。使用RFC3339格式查询。 |
| updateStartTime | string | 文件夹更新起始时间。使用RFC3339格式查询。 |
| updateEndTime | string | 文件夹更新结束时间。使用RFC3339格式查询。 |
| extend | object | 指定查询扩展Attribute。精确匹配 |
| extend.k1 | string |  |
| extend.k2 | string |  |
#### Responses

**200**: OK

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer |  |
| msg | string |  |
| data | array<object> |  |
| data[].pathType | integer | *节点类型。0-文件夹，2-文件 |
| data[].displayName | string | *文件夹显示名。 |
| data[].name | string | *文件夹名， |
| data[].alias | string | 文件夹别名。 |
| data[].id | string | 文件夹ID（LONG的字符串表示）。 |
| data[].parentAlias | string | 所属父文件夹别名。 |
| data[].description | string | 文件夹描述。 |
| data[].templateAlias | string | 模版别名 |
| data[].createTime | integer | 创建时间 |
| data[].updateTime | integer | 更新时间 |
| data[].countChildren | integer | 包含文件个数 |
| data[].extend | object | 文件夹扩展Attributes |
| data[].extend.k1 | string |  |
| data[].extend.k2 | string |  |
| data[].hasChildren | boolean | 是否有子级 |
| data[].children | array<string> | 所有子文件夹 |

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

### POST /os/open-api/uns/condition/folder

**多条件分页查询文件夹**

#### Request Body

| 字段 | 类型 | 说明 |
|------|------|------|
| aliasList | array<string> | 根据文件夹别名获取指定文件夹信息。精确匹配 |
| displayName | string | 指定文件夹显示名称。模糊匹配 |
| parentAlias | string | 指定父文件夹别名，当为空字符串时表示顶层节点 |
| templateAlias | string | 指定模版别名。精确匹配 |
| description | string | 文件夹描述。模糊匹配 |
| createStartTime | string | 文件夹创建起始时间。使用RFC3339格式查询。 |
| createEndTime | string | 文件夹创建结束时间。使用RFC3339格式查询。 |
| updateStartTime | string | 文件夹更新起始时间。使用RFC3339格式查询。 |
| updateEndTime | string | 文件夹更新结束时间。使用RFC3339格式查询。 |
| extend | object | 指定查询扩展Attribute。精确匹配 |
| extend.k1 | string |  |
| extend.k2 | string |  |
| pageNo | integer | 指定查询页码，默认1 |
| pageSize | integer | 指定分页大小。默认100，最大10000。 |
#### Responses

**200**: OK

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer |  |
| msg | string |  |
| pageNo | integer |  |
| pageSize | integer |  |
| total | integer |  |
| data | array<object> |  |
| data[].pathType | integer | *节点类型。0-文件夹，2-文件 |
| data[].displayName | string | *文件夹显示名。 |
| data[].name | string | *文件夹名， |
| data[].alias | string | 文件夹别名。 |
| data[].parentAlias | string | 所属父文件夹别名。 |
| data[].description | string | 文件夹描述。 |
| data[].templateAlias | string | 模版别名 |
| data[].createAt | integer | 创建时间 |
| data[].updateAt | integer | 更新时间 |
| data[].filesCount | integer | 包含文件个数 |
| data[].extend | object | 文件夹扩展Attributes |
| data[].extend.k1 | string |  |
| data[].extend.k2 | string |  |

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

### POST /os/open-api/uns/condition/file

**多条件分页查询文件**

#### Request Body

| 字段 | 类型 | 说明 |
|------|------|------|
| parentAliasList | array<string> | 指定文件夹别名集合（查询范围限制在这些文件夹下的属性，不含其下子文件夹中的属性）。 |
| displayName | string | 指定文件显示名称。模糊匹配 |
| description | string | 文件描述。模糊匹配 |
| createStartTime | string | 文件创建起始时间。使用RFC3339格式查询。 |
| createEndTime | string | 文件创建结束时间。使用RFC3339格式查询。 |
| updateStartTime | string | 文件更新起始时间。使用RFC3339格式查询。 |
| updateEndTime | string | 文件更新结束时间。使用RFC3339格式查询。 |
| extend | object | 指定查询扩展Attribute。精确匹配 |
| extend.k1 | string |  |
| extend.k2 | string |  |
| withValues | boolean | 是否包含文件的当前值。默认false |
| pageNo | integer | 指定查询页码，默认1 |
| pageSize | integer | 指定分页大小。默认100，最大10000。 |
#### Responses

**200**: OK

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer |  |
| msg | string |  |
| pageNo | integer |  |
| pageSize | integer |  |
| total | integer |  |
| data | array<object> |  |
| data[].pathType | integer | 节点类型。0-文件夹，2-文件 |
| data[].displayName | string | 文件显示名。 |
| data[].name | string | 文件名， |
| data[].alias | string | 文件别名。 |
| data[].parentAlias | string | 所属父文件夹别名。 |
| data[].description | string | 文件描述。 |
| data[].createAt | integer | 创建时间 |
| data[].updateAt | integer | 更新时间 |
| data[].labels | string | 标签名称多个用,分割 |
| data[].extend | object | 扩展Attributes |
| data[].extend.k1 | string |  |
| data[].extend.k2 | string |  |
| data[].save2db | boolean | 是否存储历史。 |
| data[].accessLevel | string | 北向访问级别。READ_ONLY-只读，READ_WRITE-读写。 |
| data[].dataType | integer | 1-时序，2-关系，3-时序实时计算，4-历史计算，5-告警，6-聚合，7-时序引用。 |
| data[].valueType | string | 当dataType=1/3/7时表示时序数据值类型。 |
| data[].strMaxLen | integer | 当valueType=STRING时，表示STRING最大字符数。 |
| data[].refers | array<object> |  |
| data[].refers[].alias | string |  |
| data[].refers[].field | string |  |
| data[].expression | string | 时序计算类型表达式。 |
| data[].payload | object | 文件当前值 |
| data[].payload.value | integer |  |
| data[].payload.status | string |  |
| data[].payload.timeStamp | integer |  |

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

### POST /os/open-api/uns/batch/pride

**批量创建/修改文件夹和文件**

#### Request Body

| 字段 | 类型 | 说明 |
|------|------|------|
| pathType | integer | *节点类型。0-文件夹，2-文件
 |
| displayName | string | 文件显示名。最大长度128字符，允许字符保持supOS工厂版一致。 |
| name | string | 文件名称，和文件夹显示名一致。 |
| alias | string | *文件别名。最大长度63字符，允许字符包括英文、数字、下划线。 |
| parentAlias | string | 所属父文件夹别名。 |
| description | string | 文件描述。 |
| templateAlias | string | 模版别名 |
| save2db | boolean | 是否存储历史。当为dataType=7时，无需持久化。 |
| accessLevel | string | 北向访问级别。READ_ONLY-只读，READ_WRITE-读写。目前暂不支持 |
| dataType | integer | 1-时序，2-关系，3-实时计算，4-历史计算，6-聚合，7-引用。为1/3时supOS系统默认创建"value"，"timeStamp"，"status"三个键。其中value的数据类型要和文件数据类型一致。 |
| valueType | string | 当dataType=1/3时可指定时序数据值类型。 |
| initValue | number | 当dataType=1/3时可以为该文件设置初值。创建该文件后即将此值作为value的初值 |
| strMaxLen | integer | 当valueType=STRING时，可以设置该参数。默认512字符。 |
| refers | array<object> | 当dataType=3时可指定表达式中使用到的文件别名和field名称。当dataType=7时可指定引用源文件别名，仅第一个有效，不可设置为引用类型文件别名，避免循环引用 |
| refers[].alias | string | 引用的文件别名 |
| refers[].field | string | 引用的字段 |
| refers[].variableName | string | 计算文件使用的变量名，按a1、a2依次顺延 |
| expression | string | 当dataType=3时可指定表达式，a1表示refers中第一个，a2表示第二个，以此类推。允许为空或无该字段，表示暂无表达式，此时可按照1-时序的特性来处理。 |
| extend | object | 扩展Attributes键值对 |
| extend.k1 | string |  |
| extend.k2 | string |  |
#### Responses

**200**: OK

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| msg | string |  |
| data | object |  |

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


## 实时服务

### POST /os/open-api/uns/realtime/v3/read

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

### POST /os/open-api/uns/history/v3/aggregation

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

### POST /os/open-api/uns/history/v3/sample

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

### POST /os/open-api/uns/history/v3/raw

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

