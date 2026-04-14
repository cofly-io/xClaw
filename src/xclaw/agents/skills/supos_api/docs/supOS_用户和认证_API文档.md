# 用户管理

**版本**: 1.0.0  
**OpenAPI**: 3.0.3

---
# basePath：/os/open-api/auth/v1/


## user-service

### GET /users

**获取用户列表**

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| name | query | string | 否 | * 用户别名
* 模糊搜索
 |
| type | query | integer | 否 | * 用户类型
* 1 普通用户
* 2 管理员
 |
| usercode | query | string | 否 | * 用户编号
* 模糊搜索
 |
| username | query | string | 否 | * 用户名称
* 模糊搜索
 |
| status | query | integer | 否 | * 用户状态
* 1 启用
* 0 停用
 |
| locked | query | integer | 否 | * 锁定状态
* 1 锁定
* 0 未锁定
 |
| current | query | integer | 否 | 当前页码 |
| pageSize | query | integer | 否 | 页面大小,最大1000 |
| personBound | query | boolean | 否 | * 是否绑定人员
* ture 是
* false 否
 |
| usernames | query | string | 否 | * 用户名称列表,逗号分割
* 精确匹配
 |
| brief | query | boolean | 否 | ture 排除第三方服务的数据，防止服务间请求循环调用 |

#### Responses

**200**: OK

| 字段 | 类型 | 说明 |
|------|------|------|
| pagination | Pagination |  |
| pagination.total | integer (int64) | 总数据量 |
| pagination.pageSize | integer (int64) | 每页数量 |
| pagination.current | integer (int64) | 当前页码 |
| list | array<ListItem> |  |
| list[].id | integer (int64) | 用户ID |
| list[].name | string | 用户别名 |
| list[].username | string | 用户名称 |
| list[].userCode | string | 用户编码 |
| list[].describe | string | 用户描述信息 |
| list[].userType | integer (int64) | 用户类型 (1 普通用户, 2 管理员) |
| list[].pictureUrl | string | 头像url |
| list[].status | integer (int64) | 状态 (1 启用, 0 停用) |
| list[].roles | string | 角色列表，逗号分割 |
| list[].locked | integer (int64) | 锁定状态 (0=未锁定, 1=锁定) |
| list[].lockedReason | string | 锁定原因 |
| list[].lockedTime | string | 锁定时间 |
| list[].personCode | string | 人员编号 |
| list[].personName | string | 人员名称 |
| list[].onlineStatus | integer (int64) | 在线状态 (0=离线, 1=在线) |
| list[].creator | string | 创建者 |
| list[].createTimestamp | string (date-time) | 创建时间 |
| list[].modifier | string | 更新者 |
| list[].modifyTimestamp | string (date-time) | 更新时间 |

**400**: 错误提示
* 100106220 请求参赛格式或类型错误，请检查请求参数


| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer | 错误编码
 |
| message | string | 错误提示 |

**500**: 常规的错误 100000001 服务内部异常

*无定义*


---

### POST /users

**创建用户**

#### Request Body

| 字段 | 类型 | 说明 |
|------|------|------|
| name | string | 别名 |
| username | string | 用户名 |
| password | string | 密码 |
| describe | string | 用户简介 |
| userType | integer (int64) | 用户类型(1 普通用户,2 管理员) |
| pictureUrl | string | 头像url |
| phoneNumber | string | 手机号 |
| email | string | 邮箱 |
| roleCodes | array<string> | 角色编号列表 |
#### Responses

**200**: OK

| 字段 | 类型 | 说明 |
|------|------|------|
| data | UserId |  |
| data.id | integer (int64) | 用户id |

**400**: 错误提示
* 100000003 **参数校验异常
* 100000011 授权配额受限,超过当前最大可创建用户数
* 100106303 请求参数格式或类型错误
* 100106313 手机号码无效
* 100106312 用户名无效，只能包含 数字、字母和特殊符号*()-_.
* 100106311 用户名已存在


| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer | 错误编码
 |
| message | string | 错误提示 |

**500**: 常规的错误 100000001 服务内部异常

*无定义*


---

### GET /users/{username}

**获取用户详情**

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| username | path | string | 是 | 用户名 |

#### Responses

**200**: OK

| 字段 | 类型 | 说明 |
|------|------|------|
| data | User |  |
| data.id | integer (int64) | 用户ID |
| data.name | string | 用户别名 |
| data.username | string | 用户名称 |
| data.userCode | string | 用户编码 |
| data.describe | string | 用户描述信息 |
| data.userType | integer (int64) | 用户类型 (1 普通用户, 2 管理员) |
| data.pictureUrl | string | 头像url |
| data.status | integer (int64) | 状态 (1 启用, 0 停用) |
| data.locked | integer (int64) | 锁定状态 (0=未锁定, 1=锁定) |
| data.lockedReason | string | 锁定原因 |
| data.lockedTime | string | 锁定时间 |
| data.personId | string |  |
| data.personCode | string | 人员编号 |
| data.personName | string | 人员名称 |
| data.onlineStatus | integer (int64) | 在线状态 (0=离线, 1=在线) |
| data.creator | string | 创建者 |
| data.createTimestamp | string (date-time) | 创建时间 |
| data.modifier | string | 更新者 |
| data.modifyTimestamp | string (date-time) | 更新时间 |

**400**: 错误提示
* 100106310 用户未找到


| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer | 错误编码
 |
| message | string | 错误提示 |

---

### PUT /users/{username}

**更新用户**

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| username | path | string | 是 | 用户名 |
| ignoreRole | query | boolean | 否 | 是否忽略角色信息 |

#### Request Body

| 字段 | 类型 | 说明 |
|------|------|------|
| name | string | 用户别名 |
| username | string | 用户名称:
 * 与url中的username一致时，不做修改及校验
 * 与url中的username不一致时:
   - 校验是否开启用户名允许修改(系统设置》用户权限管理》用户权限配置)
   - 校验用户名是否被使用
 |
| describe | string | 用户简介 |
| pictureUrl | string | 头像url |
| phoneNumber | string | 手机号 |
| email | string | 邮箱 |
| roleCodes | array<string> | 用户角色编号 |
#### Responses

**200**: OK

*无定义*


**400**: 错误提示
* 100106310 用户未找到
* 100000003 **参数校验异常
* 100106303 请求参数格式或类型错误
* 100106313 手机号码无效
* 100106312 用户名无效，只能包含 数字、字母和特殊符号*()-_.
* 100106311 用户名已存在
* 100106083 用户名不允许修改!


| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer | 错误编码
 |
| message | string | 错误提示 |

---

### GET /users/{username}/contactInfo

**获取用户联系方式**

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| username | path | string | 是 | 用户名 |

#### Responses

**200**: OK

| 字段 | 类型 | 说明 |
|------|------|------|
| data | object |  |
| data.phoneNumber | string | 用户手机号 |
| data.Email | string | 用户邮箱 |

**400**: 错误提示
* 100106310 用户未找到


| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer | 错误编码
 |
| message | string | 错误提示 |

---

### PUT /users/{username}/locked

**锁定用户，限制用户登录**

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| username | path | string | 是 | 用户名 |

#### Request Body

| 字段 | 类型 | 说明 |
|------|------|------|
| lockedReason | string |  |
#### Responses

**200**: OK


---

### PUT /users/{username}/unlock

**解锁用户，解除用户登录限制**

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| username | path | string | 是 | 用户名 |

#### Responses

**200**: OK


---

### PUT /users/{username}/disable

**停用用户**

* 用户离职时需停用；
* 停用后用户在用户选择器中无法被选中
* 停用后用户无法登录


#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| username | path | string | 是 | 用户名 |

#### Responses

**200**: OK


---

### PUT /users/{username}/enable

**启用用户**

* 启用后用户在用户选择器中可以展示
* 启用后用户可以登录


#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| username | path | string | 是 | 用户名 |

#### Responses

**200**: OK


---

