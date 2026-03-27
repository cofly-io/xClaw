# 菜单配置

**版本**: 1.0.0  
**OpenAPI**: 3.0.1

---
# basePath：/os/open-api/rbac/v1/

## 菜单管理

### GET /menus

**分页查询菜单列表**

分页查询菜单列表，支持多种筛选条件。

## 功能特性
- 支持按菜单名称、自定义名称筛选
- 支持按状态（禁用、隐藏）筛选
- 支持按作用域、父菜单筛选
- 支持按创建人、时间范围筛选
- 支持时区转换
- 分页查询，支持自定义页码和页大小

## 使用场景
- 菜单管理页面列表展示
- 菜单搜索和筛选
- 菜单权限管理
- 菜单统计分析


#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| name | query | string | 否 | 菜单名称，支持模糊查询 |
| customName | query | string | 否 | 菜单自定义名称，支持模糊查询 |
| disabled | query | boolean | 否 | 是否禁用，true=禁用，false=启用 |
| hidden | query | boolean | 否 | 是否隐藏，true=隐藏，false=显示 |
| scope | query | string (runtime, design) | 否 | 菜单作用域，runtime=运行期，design=设计期 |
| parentCode | query | string | 否 | 父菜单编码，用于查询子菜单 |
| creator | query | string | 否 | 创建人，支持模糊查询 |
| createStartTime | query | string | 否 | 创建时间开始，格式：yyyy-MM-dd HH:mm:ss |
| createEndTime | query | string | 否 | 创建时间结束，格式：yyyy-MM-dd HH:mm:ss |
| updateStartTime | query | string | 否 | 更新时间开始，格式：yyyy-MM-dd HH:mm:ss |
| updateEndTime | query | string | 否 | 更新时间结束，格式：yyyy-MM-dd HH:mm:ss |
| timeZone | query | string | 否 | 时区，用于时间参数转换，默认为GMT+0800 |
| current | query | integer | 否 | 当前页码，从1开始 |
| pageSize | query | integer | 否 | 每页大小，最大500 |

#### Responses

**200**: 查询成功

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 状态编码，请求正确，返回100000000；异常时返回对应错误编号 |
| message | string | 提示信息，请求正确，返回success；异常时返回错误描述信息 |
| pagination | object | 分页信息 |
| pagination.total | integer | 总记录数 |
| pagination.current | integer | 当前页码 |
| pagination.pageSize | integer | 每页条数 |
| list | array<MenuDTO> | 菜单列表 |
| list[].modifyTime | string (date-time) | 修改时间 |
| list[].createTime | string (date-time) | 创建时间 |
| list[].terminator | string | 终止者 |
| list[].modifier | string | 修改人 |
| list[].creator | string | 创建人 |
| list[].code | string | 菜单编码，唯一标识 |
| list[].name | string | 菜单名称 |
| list[].customName | string | 菜单自定义名称 |
| list[].showType | string | 显示类型 |
| list[].menuType | string | 菜单类型 |
| list[].scope | string (runtime, design) | 作用域，runtime=运行期，design=设计期 |
| list[].applicableTerminals | array<TerminalType> | 适用终端列表 |
| list[].hidden | boolean | 是否隐藏 |
| list[].disabled | boolean | 是否禁用 |
| list[].shareable | string | 是否可共享 |
| list[].iconUrl | string | 图标URL |
| list[].customIconUrl | string | 自定义图标URL |
| list[].displayOrder | number (double) | 显示顺序 |
| list[].url | string | URL路径 |
| list[].targetType | string (SELF, BLANK) | 菜单打开方式：SELF当前页、BLANK新空白页。默认为SELF。 |
| list[].appId | string | 应用ID |
| list[].description | string | 描述信息 |
| list[].fullPath | string | 完整路径 |
| list[].source | string | 数据来源 |
| list[].menuOperations | array<MenuOperationDTO> | 菜单操作列表 |
| list[].menuOperations[].modifyTime | string (date-time) | 修改时间 |
| list[].menuOperations[].createTime | string (date-time) | 创建时间 |
| list[].menuOperations[].modifier | string | 修改人 |
| list[].menuOperations[].creator | string | 创建人 |
| list[].menuOperations[].code | string | 菜单操作编码，唯一标识 |
| list[].menuOperations[].name | string | 菜单操作名称 |
| list[].menuOperations[].description | string | 描述信息 |
| list[].menuOperations[].displayOrder | number (double) | 显示顺序 |
| list[].menuOperations[].menuOperateUrls | array<MenuOperateUrlDTO> | 菜单操作URL列表 |
| list[].menuOperations[].menuOperateUrls[].methodType | string (GET, POST, PUT, DELETE, PATCH) | HTTP方法类型（如 GET、POST） |
| list[].menuOperations[].menuOperateUrls[].url | string | URL路径（接口地址） |
| list[].menuOperations[].menuOperateUrls[].appId | string | 应用ID（关联具体应用） |

**400**: 请求参数错误

| 字段 | 类型 | 说明 |
|------|------|------|
| code | string | 错误代码 |
| message | string | 错误消息 |
| details | object | 错误详情 |
| timestamp | string (date-time) | 错误发生时间 |

**401**: 未授权访问

| 字段 | 类型 | 说明 |
|------|------|------|
| code | string | 错误代码 |
| message | string | 错误消息 |
| details | object | 错误详情 |
| timestamp | string (date-time) | 错误发生时间 |

**403**: 权限不足

| 字段 | 类型 | 说明 |
|------|------|------|
| code | string | 错误代码 |
| message | string | 错误消息 |
| details | object | 错误详情 |
| timestamp | string (date-time) | 错误发生时间 |

**500**: 服务器内部错误

| 字段 | 类型 | 说明 |
|------|------|------|
| code | string | 错误代码 |
| message | string | 错误消息 |
| details | object | 错误详情 |
| timestamp | string (date-time) | 错误发生时间 |

---

