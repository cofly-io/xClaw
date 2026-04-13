# 联邦查询

**版本**: v1  
**OpenAPI**: 3.0.0

---
# basePath：/os/open-api/fedquery/v1/

## Database

### GET /databases

**分页查询所有Database信息 (不包含Schemas)**

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| current | query | integer | 否 | 页码 (从1开始) |
| pageSize | query | integer | 否 | 每页记录数 |

#### Responses

**200**: 成功查询到Database列表

| 字段 | 类型 | 说明 |
|------|------|------|
| pagination | PaginationInfo | 分页信息 |
| pagination.total | integer (int64) | 总记录数 |
| pagination.current | integer | 当前页码 (从1开始) |
| pagination.pageSize | integer | 每页记录数 |
| list | array<DatabaseMinimal> | 数据库列表数据 |
| list[].id | integer (uint32) | 数据库的唯一标识符 |
| list[].name | string | 数据库名 |
| list[].description | string | 数据库描述 |

**400**: 参数校验失败

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误代码
- 0: Success - 成功
- 1: UnKnownError - 未知错误
- 2: NotFound - 未找到
- 3: InvalidParameter - 无效参数
- 4: IllegalParam - 非法参数
- 5: InvalidAuthority - 非法授权
- 6: Unexpected - 意外错误
- 7: Duplicated - 重复
- 8: DatabaseError - 数据库错误
- 9: Timeout - 超时
 |
| message | string | 简短的错误信息 |
| detailMsg | string | 详细的错误信息 |
| targetService | string | 发生错误的服务名 |

---


## Schema

### GET /schemas

**分页查询指定Database下的所有Schema信息 (不包含Tables)**

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| database | query | string | 是 | 数据库名称 |
| current | query | integer | 否 | 页码 (从1开始) |
| pageSize | query | integer | 否 | 每页记录数 |

#### Responses

**200**: 成功查询到Schema列表

| 字段 | 类型 | 说明 |
|------|------|------|
| pagination | PaginationInfo | 分页信息 |
| pagination.total | integer (int64) | 总记录数 |
| pagination.current | integer | 当前页码 (从1开始) |
| pagination.pageSize | integer | 每页记录数 |
| list | array<SchemaMinimal> | 模式列表数据 |
| list[].id | integer (uint32) | 模式的唯一标识符 |
| list[].name | string | 模式名 |

**400**: 参数校验失败

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误代码
- 0: Success - 成功
- 1: UnKnownError - 未知错误
- 2: NotFound - 未找到
- 3: InvalidParameter - 无效参数
- 4: IllegalParam - 非法参数
- 5: InvalidAuthority - 非法授权
- 6: Unexpected - 意外错误
- 7: Duplicated - 重复
- 8: DatabaseError - 数据库错误
- 9: Timeout - 超时
 |
| message | string | 简短的错误信息 |
| detailMsg | string | 详细的错误信息 |
| targetService | string | 发生错误的服务名 |

**404**: Database不存在

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误代码
- 0: Success - 成功
- 1: UnKnownError - 未知错误
- 2: NotFound - 未找到
- 3: InvalidParameter - 无效参数
- 4: IllegalParam - 非法参数
- 5: InvalidAuthority - 非法授权
- 6: Unexpected - 意外错误
- 7: Duplicated - 重复
- 8: DatabaseError - 数据库错误
- 9: Timeout - 超时
 |
| message | string | 简短的错误信息 |
| detailMsg | string | 详细的错误信息 |
| targetService | string | 发生错误的服务名 |

---


## Table

### GET /tables

**分页查询指定Schema下的所有Table信息列表**

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| database | query | string | 是 | 数据库名称 |
| schema | query | string | 是 | 模式名称 |
| current | query | integer | 否 | 页码 (从1开始) |
| pageSize | query | integer | 否 | 每页记录数 |

#### Responses

**200**: 成功查询到Table列表

| 字段 | 类型 | 说明 |
|------|------|------|
| pagination | PaginationInfo | 分页信息 |
| pagination.total | integer (int64) | 总记录数 |
| pagination.current | integer | 当前页码 (从1开始) |
| pagination.pageSize | integer | 每页记录数 |
| list | array<TableMinimal> | 表列表数据 |
| list[].id | integer (uint32) | 表的唯一标识符 |
| list[].name | string | 表名 |
| list[].description | string | 表描述 |

**400**: 参数校验失败

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误代码
- 0: Success - 成功
- 1: UnKnownError - 未知错误
- 2: NotFound - 未找到
- 3: InvalidParameter - 无效参数
- 4: IllegalParam - 非法参数
- 5: InvalidAuthority - 非法授权
- 6: Unexpected - 意外错误
- 7: Duplicated - 重复
- 8: DatabaseError - 数据库错误
- 9: Timeout - 超时
 |
| message | string | 简短的错误信息 |
| detailMsg | string | 详细的错误信息 |
| targetService | string | 发生错误的服务名 |

---

### GET /table/detail

**查询单个Table的详细信息 (包含Columns)**

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| database | query | string | 是 | 数据库名称 |
| schema | query | string | 是 | 模式名称 |
| table | query | string | 是 | 表名称 |

#### Responses

**200**: 成功查询到Table的详细信息

| 字段 | 类型 | 说明 |
|------|------|------|
| id | integer (uint32) | 表的唯一标识符 |
| name | string | 表名 |
| description | string | 表描述 |
| columns | array<Column> | 列信息列表 |
| columns[].columnName | string | 列名 |
| columns[].dataType | string | 数据类型 |
| columns[].columnComment | string | 列注释 |

**400**: 参数校验失败

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误代码
- 0: Success - 成功
- 1: UnKnownError - 未知错误
- 2: NotFound - 未找到
- 3: InvalidParameter - 无效参数
- 4: IllegalParam - 非法参数
- 5: InvalidAuthority - 非法授权
- 6: Unexpected - 意外错误
- 7: Duplicated - 重复
- 8: DatabaseError - 数据库错误
- 9: Timeout - 超时
 |
| message | string | 简短的错误信息 |
| detailMsg | string | 详细的错误信息 |
| targetService | string | 发生错误的服务名 |

**404**: Table不存在

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误代码
- 0: Success - 成功
- 1: UnKnownError - 未知错误
- 2: NotFound - 未找到
- 3: InvalidParameter - 无效参数
- 4: IllegalParam - 非法参数
- 5: InvalidAuthority - 非法授权
- 6: Unexpected - 意外错误
- 7: Duplicated - 重复
- 8: DatabaseError - 数据库错误
- 9: Timeout - 超时
 |
| message | string | 简短的错误信息 |
| detailMsg | string | 详细的错误信息 |
| targetService | string | 发生错误的服务名 |

---


## SQL

### POST /command/execute

**执行SQL查询语句**

#### Request Body

#### Responses

**Request body**
纯文本SQL查询语句
Example value：select * from fqe_d084a6f7e0.public.intg_work_order_staging
格式是:select * from 数据库名称.Schema 名称.表名

**200**: 成功执行SQL并返回结果集

| 字段 | 类型 | 说明 |
|------|------|------|
| columns | array<ColumnMinimal> | 结果集列定义 |
| columns[].columnName | string | 列名 |
| columns[].dataType | string | 数据类型 |
| rows | array<object> | 结果集数据行，每行表示为一个动态对象 |

**400**: 参数校验失败（例如SQL语句为空）或SQL语法错误

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误代码
- 0: Success - 成功
- 1: UnKnownError - 未知错误
- 2: NotFound - 未找到
- 3: InvalidParameter - 无效参数
- 4: IllegalParam - 非法参数
- 5: InvalidAuthority - 非法授权
- 6: Unexpected - 意外错误
- 7: Duplicated - 重复
- 8: DatabaseError - 数据库错误
- 9: Timeout - 超时
 |
| message | string | 简短的错误信息 |
| detailMsg | string | 详细的错误信息 |
| targetService | string | 发生错误的服务名 |

**428**: SQL执行时发生错误，例如查询返回数据集条数超过限制

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误代码
- 0: Success - 成功
- 1: UnKnownError - 未知错误
- 2: NotFound - 未找到
- 3: InvalidParameter - 无效参数
- 4: IllegalParam - 非法参数
- 5: InvalidAuthority - 非法授权
- 6: Unexpected - 意外错误
- 7: Duplicated - 重复
- 8: DatabaseError - 数据库错误
- 9: Timeout - 超时
 |
| message | string | 简短的错误信息 |
| detailMsg | string | 详细的错误信息 |
| targetService | string | 发生错误的服务名 |

---

