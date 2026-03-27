# 企业组织架构

**版本**: v0  
**OpenAPI**: 3.1.0

---
# basePath：/os/open-api/org/v1/


## 岗位API

### GET /positions/{code}

**根据编码查找岗位**

根据编码查找岗位,同时会查询出来岗位关联的部门、角色、创建人、修改人信息

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| code | path | string | 是 | 岗位编码 |

#### Responses

**400**: Bad Request

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| message | string |  |
| detailMsg | string |  |
| targetService | string |  |
| data | object |  |

**500**: Internal Server Error

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| message | string |  |
| detailMsg | string |  |
| targetService | string |  |
| data | object |  |

**200**: OK

| 字段 | 类型 | 说明 |
|------|------|------|
| id | integer (int64) | 岗位ID |
| code | string | 岗位编码 |
| name | string | 岗位名称 |
| companyId | integer (int64) | 岗位名称 |
| deptId | integer (int64) | 关联的部门id |
| parentId | integer (int64) | 上级岗位id如果上级是公司则为空 |
| description | string | 描述 |
| displayOrder | number (double) | 顺序 |
| roleCodes | array<string> | 关联角色codes |
| companyName | string | 公司名称 |
| companyCode | string | 公司编码 |
| deptName | string | 部门名称 |
| deptCode | string | 部门编码 |
| deptFullPath | string | 部门全路径 |
| parentCode | string | 上级岗位编码 |
| parentName | string | 上级岗位名称 |
| parentFullPath | string | 上级岗位全路径 |
| layNo | integer (int32) | 岗位层级 |
| fullPath | string | 岗位全路径 |
| layRec | string | 岗位id全路径 |
| status | integer (int32) | 岗位状态0停用 1启用 |
| roleDTOS | array<Role> | 岗位角色集合 |
| roleDTOS[].name | string |  |
| roleDTOS[].code | string |  |
| roleDTOS[].systemInit | boolean |  |
| roleDTOS[].description | string |  |
| roleDTOS[].groupCode | string |  |
| roleDTOS[].disabled | boolean |  |
| roleDTOS[].deleted | integer (int32) |  |
| roleDTOS[].displayOrder | number (double) |  |
| roleDTOS[].deleteTime | string (date-time) |  |
| roleDTOS[].modifyTime | string (date-time) |  |
| roleDTOS[].createTime | string (date-time) |  |
| roleDTOS[].terminator | string |  |
| roleDTOS[].creator | string |  |
| roleDTOS[].modifier | string |  |

---

### PUT /positions/{code}

**修改岗位**

修改岗位,当调整岗位关联的角色编码后,会根据最新的角色去动态调整人员对应的用户和角色绑定关系

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| code | path | string | 是 | 岗位编码 |

#### Request Body

| 字段 | 类型 | 说明 |
|------|------|------|
| code | string | 部门编码,只支持大小写英文、数字、-_ |
| name | string | 岗位名称 |
| companyCode | string | 所属公司编码,只支持大小写英文、数字、-_ |
| departmentCode | string | 关联的部门编码,只支持大小写英文、数字、-_ |
| parentCode | string | 上级岗位编码如果上级是公司则为空 |
| description | string | 描述 |
| roleCodes | array<string> | 角色编码集合 |
#### Responses

**400**: Bad Request

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| message | string |  |
| detailMsg | string |  |
| targetService | string |  |
| data | object |  |

**500**: Internal Server Error

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| message | string |  |
| detailMsg | string |  |
| targetService | string |  |
| data | object |  |

**200**: OK

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| message | string |  |
| detailMsg | string |  |
| targetService | string |  |
| data | object |  |

---

### PUT /positions/{code}/status

**修改岗位状态**

修改岗位状态,启用或者停用岗位状态

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| code | path | string | 是 | 岗位编码 |

#### Request Body

| 字段 | 类型 | 说明 |
|------|------|------|
| status | integer (int32) | 岗位状态:0停用,1启用 |
#### Responses

**400**: Bad Request

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| message | string |  |
| detailMsg | string |  |
| targetService | string |  |
| data | object |  |

**500**: Internal Server Error

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| message | string |  |
| detailMsg | string |  |
| targetService | string |  |
| data | object |  |

**200**: OK

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| message | string |  |
| detailMsg | string |  |
| targetService | string |  |
| data | object |  |

---

### GET /positions

**分页查询岗位信息**

分页查询岗位信息,同时会查询出来岗位关联的部门、角色、创建人、修改人信息,当brief设置为true的时只会查询出来岗位关联的部门信息

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| name | query | string | 否 | 岗位的名字,最大255位,支持模糊匹配 |
| brief | query | boolean | 否 | 是否简单查询,默认是false,当设置为true时只会查询出来岗位关联的部门信息,不会去第三方服务查询角色、创建人、修改人的信息 |
| codes | query | array<string> | 否 | 岗位编码集合,最大200个岗位编码 |
| departmentCodes | query | array<string> | 否 | 部门编码集合,最大50个部门编码 |
| current | query | integer | 否 | 当前页 |
| pageSize | query | integer | 否 | 每页行 |
| status | query | integer | 否 | 岗位状态:0停用 1启用 |

#### Responses

**400**: Bad Request

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| message | string |  |
| detailMsg | string |  |
| targetService | string |  |
| data | object |  |

**500**: Internal Server Error

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| message | string |  |
| detailMsg | string |  |
| targetService | string |  |
| data | object |  |

**200**: OK

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| message | string |  |
| detailMsg | string |  |
| targetService | string |  |
| pagination | Pagination |  |
| pagination.total | integer (int32) |  |
| pagination.current | integer (int32) |  |
| pagination.pageSize | integer (int32) |  |
| pagination.countTotal | boolean |  |
| list | array<Position> |  |
| list[].id | integer (int64) | 岗位ID |
| list[].code | string | 岗位编码 |
| list[].name | string | 岗位名称 |
| list[].companyId | integer (int64) | 岗位名称 |
| list[].deptId | integer (int64) | 关联的部门id |
| list[].parentId | integer (int64) | 上级岗位id如果上级是公司则为空 |
| list[].description | string | 描述 |
| list[].displayOrder | number (double) | 顺序 |
| list[].roleCodes | array<string> | 关联角色codes |
| list[].companyName | string | 公司名称 |
| list[].companyCode | string | 公司编码 |
| list[].deptName | string | 部门名称 |
| list[].deptCode | string | 部门编码 |
| list[].deptFullPath | string | 部门全路径 |
| list[].parentCode | string | 上级岗位编码 |
| list[].parentName | string | 上级岗位名称 |
| list[].parentFullPath | string | 上级岗位全路径 |
| list[].layNo | integer (int32) | 岗位层级 |
| list[].fullPath | string | 岗位全路径 |
| list[].layRec | string | 岗位id全路径 |
| list[].status | integer (int32) | 岗位状态0停用 1启用 |
| list[].roleDTOS | array<Role> | 岗位角色集合 |
| list[].roleDTOS[].name | string |  |
| list[].roleDTOS[].code | string |  |
| list[].roleDTOS[].systemInit | boolean |  |
| list[].roleDTOS[].description | string |  |
| list[].roleDTOS[].groupCode | string |  |
| list[].roleDTOS[].disabled | boolean |  |
| list[].roleDTOS[].deleted | integer (int32) |  |
| list[].roleDTOS[].displayOrder | number (double) |  |
| list[].roleDTOS[].deleteTime | string (date-time) |  |
| list[].roleDTOS[].modifyTime | string (date-time) |  |
| list[].roleDTOS[].createTime | string (date-time) |  |
| list[].roleDTOS[].terminator | string |  |
| list[].roleDTOS[].creator | string |  |
| list[].roleDTOS[].modifier | string |  |

---

### POST /positions

**新增岗位**

新增岗位,创建新的岗位数据

#### Request Body

| 字段 | 类型 | 说明 |
|------|------|------|
| code | string | 部门编码,只支持大小写英文、数字、-_ |
| name | string | 岗位名称 |
| companyCode | string | 所属公司编码,只支持大小写英文、数字、-_ |
| departmentCode | string | 关联的部门编码,只支持大小写英文、数字、-_ |
| parentCode | string | 上级岗位编码,只支持大小写英文、数字、-_ |
| description | string | 描述 |
| roleCodes | array<string> | 角色 |
#### Responses

**400**: Bad Request

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| message | string |  |
| detailMsg | string |  |
| targetService | string |  |
| data | object |  |

**500**: Internal Server Error

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| message | string |  |
| detailMsg | string |  |
| targetService | string |  |
| data | object |  |

**200**: OK

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| message | string |  |
| detailMsg | string |  |
| targetService | string |  |
| data | object |  |

---

### DELETE /positions/{codes}

**批量根据编码删除岗位**

批量根据编码删除岗位,只能删除已经停用的岗位数据

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| codes | path | array<string> | 是 | 岗位编码集合,最多传入100个编码 |

#### Responses

**400**: Bad Request

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| message | string |  |
| detailMsg | string |  |
| targetService | string |  |
| data | object |  |

**500**: Internal Server Error

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| message | string |  |
| detailMsg | string |  |
| targetService | string |  |
| data | object |  |

**200**: OK

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| message | string |  |
| detailMsg | string |  |
| targetService | string |  |
| data | object |  |

---


## 人员API

### GET /people/{code}

**根据编码获取人员**

根据编码获取人员信息,当brief传入true的时候不会去查询关联用户的信息

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| code | path | string | 是 | 人员编码 |
| brief | query | boolean | 否 | 是否简单查询,当brief传入true的时候不会去查询关联用户的信息,默认false |

#### Responses

**400**: Bad Request

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| message | string |  |
| detailMsg | string |  |
| targetService | string |  |
| data | object |  |

**500**: Internal Server Error

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| message | string |  |
| detailMsg | string |  |
| targetService | string |  |
| data | object |  |

**200**: OK

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| message | string |  |
| detailMsg | string |  |
| targetService | string |  |
| data | Person | 人员 |
| data.id | integer (int64) | 人员ID |
| data.code | string | 人员编码 |
| data.name | string | 人员姓名 |
| data.gender | integer (int32) | 人员性别 |
| data.status | integer (int32) | 人员状态 |
| data.classifiedLevel | string | 涉密等级 |
| data.description | string | 人员描述 |
| data.createUser | boolean | 是否创建用户,默认是false |
| data.userId | integer (int64) | 用户Id |
| data.userName | string | 用户名 |
| data.password | string | 用户密码 |
| data.avatarUrl | string | 头像地址 |
| data.userDescription | string | 用户描述 |
| data.userPhone | string | 用户手机 |
| data.userEmail | string | 用户邮箱 |
| data.directLeaderIds | array<integer> | 直属领导id |
| data.directLeaders | array<PersonLeader> | 直属领导 |
| data.directLeaders[].id | integer (int64) | 人员id |
| data.directLeaders[].code | string | 人员编码 |
| data.directLeaders[].name | string | 人员名称 |
| data.directLeaders[].userId | integer (int64) | 用户id |
| data.grandLeaderIds | array<integer> | 隔级领导id |
| data.grandLeaders | array<PersonLeader> | 隔级领导 |
| data.grandLeaders[].id | integer (int64) | 人员id |
| data.grandLeaders[].code | string | 人员编码 |
| data.grandLeaders[].name | string | 人员名称 |
| data.grandLeaders[].userId | integer (int64) | 用户id |
| data.entryDate | string | 入职日期 |
| data.resignationDate | string | 离职日期 |
| data.title | string (1,2,3) | 职称: 1初级、2中级、3高级 |
| data.qualification | string | 资质 |
| data.education | string (1,2,3,4,5,6) | 学历:1博士、2硕士、3本科、4大专、5高中/中专、6初中及以下 |
| data.major | string | 专业 |
| data.idNumber | string | 证号 |
| data.idNumberType | integer (int32) | 证类型1身份证、2护照、3港澳通行证、4其他 |
| data.displayOrder | integer (int32) | 排序 |
| data.personRelations | array<PersonRelation> | 人员关系 |
| data.personRelations[].companyCode | string | 公司编码,只支持大小写英文、数字、-_ |
| data.personRelations[].departmentCode | string | 部门编码,只支持大小写英文、数字、-_ |
| data.personRelations[].positionCode | string | 岗位编码,只支持大小写英文、数字、-_ |
| data.personRelations[].postDate | string | 上岗时间格式: yyyy-MM-dd |
| data.personRelations[].description | string | 关系描述 |
| data.personRelations[].isDefault | boolean | 是否默认,所有关系中只有一条关系是true,或者全部false |

---

### PUT /people/{code}

**修改人员**

修改人员,修改人员数据,同时也可以修改人员与公司部门岗位的关系,也可以修改和删除关联的用户信息.

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| code | path | string | 是 | 人员编码集合 |

#### Request Body

| 字段 | 类型 | 说明 |
|------|------|------|
| code | string | 人员编码,只支持大小写英文、数字、-_ |
| name | string | 人员姓名 |
| gender | integer (0,1) (int32) | 人员性别:1男,0女 |
| description | string | 人员描述 |
| createUser | boolean | 是否创建用户,默认是false |
| userId | integer (int64) | 用户ID |
| userName | string | 用户名 |
| password | string | 用户密码,长度和规范根据系统配置而定 |
| avatarUrl | string | 头像地址 |
| userDescription | string | 用户描述 |
| userPhone | string | 用户手机 |
| userEmail | string | 用户邮箱 |
| directLeaderCodes | array<string> | 直属领导编码集合 |
| grandLeaderCodes | array<string> | 隔级领导编码集合 |
| entryDate | string | 入职日期格式:yyyy-MM-ddd |
| resignationDate | string | 入职日期格式:yyyy-MM-ddd |
| title | string (1,2,3) | 职称:1初级、2中级、3高级 |
| qualification | string | 资质 |
| education | integer (1,2,3,4,5,6) (int32) | 学历:1博士、2硕士、3本科、4大专、5高中/中专、6初中及以下 |
| major | string | 专业 |
| idNumber | string | 证号 |
| idNumberType | integer (1,2,3,4) (int32) | 证类型:1身份证、2护照、3港澳通行证、4其他 |
| personRelations | array<PersonRelation> | 人员公司部门岗位关系 |
| personRelations[].companyCode | string | 公司编码,只支持大小写英文、数字、-_ |
| personRelations[].departmentCode | string | 部门编码,只支持大小写英文、数字、-_ |
| personRelations[].positionCode | string | 岗位编码,只支持大小写英文、数字、-_ |
| personRelations[].postDate | string | 上岗时间格式: yyyy-MM-dd |
| personRelations[].description | string | 关系描述 |
| personRelations[].isDefault | boolean | 是否默认,所有关系中只有一条关系是true,或者全部false |
#### Responses

**400**: Bad Request

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| message | string |  |
| detailMsg | string |  |
| targetService | string |  |
| data | object |  |

**500**: Internal Server Error

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| message | string |  |
| detailMsg | string |  |
| targetService | string |  |
| data | object |  |

**200**: OK

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| message | string |  |
| detailMsg | string |  |
| targetService | string |  |
| data | object |  |

---

### PUT /people/{code}/status

**修改人员状态**

修改人员状态,可以同步修改关联用户的状态,恢复在职时可以同步恢复之前的关系数据,或者丢弃之前的关系数据.

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| code | path | string | 是 | 人员编码集合 |

#### Request Body

| 字段 | 类型 | 说明 |
|------|------|------|
| status | integer (int32) | 人员状态:0停用,1启用,2休假 |
| username | string | 关联用户名称,从停用变为启用时,用于修改用户名 |
| optUser | boolean | 是否同步操作用户 |
#### Responses

**400**: Bad Request

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| message | string |  |
| detailMsg | string |  |
| targetService | string |  |
| data | object |  |

**500**: Internal Server Error

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| message | string |  |
| detailMsg | string |  |
| targetService | string |  |
| data | object |  |

**200**: OK

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| message | string |  |
| detailMsg | string |  |
| targetService | string |  |
| data | object |  |

---

### GET /people

**分页查询人员**

根据编码、名字、部门、岗位、用户、等多维度条件来进行分页查询人员信息

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| name | query | string | 否 | 人员名字,支持模糊匹配 |
| keyword | query | string | 否 | keyword,当填入该值的时候会去名字和编码字段模糊匹配数据 |
| departmentCodes | query | array<string> | 否 | 部门编码集合,查询部门下的人员数据,当isRecursion为true的时候会去递归查询部门及下级部门的人员数据 |
| positionCodes | query | array<string> | 否 | 岗位编码集合,查询岗位下的人员数据,当isRecursion为true的时候会去递归查询岗位及下级岗位的人员数据 |
| isRecursion | query | boolean | 否 | 是否递归部门或者岗位查询 |
| notInDept | query | boolean | 否 | 是否查询没有任何部门下人员,不能和部门编码同时有值 |
| userIds | query | array<integer> | 否 | 用户ID集合,最多传入200个 |
| codes | query | array<string> | 否 | 人员编码集合,最多传入200个 |
| current | query | integer | 否 | 当前页 |
| pageSize | query | integer | 否 | 每页行数 |
| brief | query | boolean | 否 | 是否简单查询 |
| isBindUser | query | boolean | 否 | 是否过滤掉绑定用户的人员,不能和用户id集合同时有值 |
| desensitization | query | boolean | 否 | 是否强制脱敏,当传入该值的时候无视系统配置 |
| status | query | array<integer> | 否 | 状态集合,0离职,1在职,2休假 |

#### Responses

**400**: Bad Request

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| message | string |  |
| detailMsg | string |  |
| targetService | string |  |
| data | object |  |

**500**: Internal Server Error

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| message | string |  |
| detailMsg | string |  |
| targetService | string |  |
| data | object |  |

**200**: OK

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| message | string |  |
| detailMsg | string |  |
| targetService | string |  |
| pagination | Pagination |  |
| pagination.total | integer (int32) |  |
| pagination.current | integer (int32) |  |
| pagination.pageSize | integer (int32) |  |
| pagination.countTotal | boolean |  |
| list | array<Person> |  |
| list[].id | integer (int64) | 人员ID |
| list[].code | string | 人员编码 |
| list[].name | string | 人员姓名 |
| list[].gender | integer (int32) | 人员性别 |
| list[].status | integer (int32) | 人员状态 |
| list[].classifiedLevel | string | 涉密等级 |
| list[].description | string | 人员描述 |
| list[].createUser | boolean | 是否创建用户,默认是false |
| list[].userId | integer (int64) | 用户Id |
| list[].userName | string | 用户名 |
| list[].password | string | 用户密码 |
| list[].avatarUrl | string | 头像地址 |
| list[].userDescription | string | 用户描述 |
| list[].userPhone | string | 用户手机 |
| list[].userEmail | string | 用户邮箱 |
| list[].directLeaderIds | array<integer> | 直属领导id |
| list[].directLeaders | array<PersonLeader> | 直属领导 |
| list[].directLeaders[].id | integer (int64) | 人员id |
| list[].directLeaders[].code | string | 人员编码 |
| list[].directLeaders[].name | string | 人员名称 |
| list[].directLeaders[].userId | integer (int64) | 用户id |
| list[].grandLeaderIds | array<integer> | 隔级领导id |
| list[].grandLeaders | array<PersonLeader> | 隔级领导 |
| list[].grandLeaders[].id | integer (int64) | 人员id |
| list[].grandLeaders[].code | string | 人员编码 |
| list[].grandLeaders[].name | string | 人员名称 |
| list[].grandLeaders[].userId | integer (int64) | 用户id |
| list[].entryDate | string | 入职日期 |
| list[].resignationDate | string | 离职日期 |
| list[].title | string (1,2,3) | 职称: 1初级、2中级、3高级 |
| list[].qualification | string | 资质 |
| list[].education | string (1,2,3,4,5,6) | 学历:1博士、2硕士、3本科、4大专、5高中/中专、6初中及以下 |
| list[].major | string | 专业 |
| list[].idNumber | string | 证号 |
| list[].idNumberType | integer (int32) | 证类型1身份证、2护照、3港澳通行证、4其他 |
| list[].displayOrder | integer (int32) | 排序 |
| list[].personRelations | array<PersonRelation> | 人员关系 |
| list[].personRelations[].companyCode | string | 公司编码,只支持大小写英文、数字、-_ |
| list[].personRelations[].departmentCode | string | 部门编码,只支持大小写英文、数字、-_ |
| list[].personRelations[].positionCode | string | 岗位编码,只支持大小写英文、数字、-_ |
| list[].personRelations[].postDate | string | 上岗时间格式: yyyy-MM-dd |
| list[].personRelations[].description | string | 关系描述 |
| list[].personRelations[].isDefault | boolean | 是否默认,所有关系中只有一条关系是true,或者全部false |

---

### POST /people

**新增人员**

新增人员,创建新的人员数据,可以关联公司部门岗位的关系,也可以关联用户或者同步创建用户认证的信息.

#### Request Body

| 字段 | 类型 | 说明 |
|------|------|------|
| code | string | 人员编码,只支持大小写英文、数字、-_ |
| name | string | 人员姓名 |
| gender | integer (0,1) (int32) | 人员性别:1男,0女 |
| status | integer (0,1,2) (int32) | 人员状态:0离职,1在职,2休假 |
| description | string | 人员描述 |
| createUser | boolean | 是否创建用户,默认是false |
| userId | integer (int64) | 用户ID |
| userName | string | 用户名 |
| password | string | 用户密码,长度和规范根据系统配置而定 |
| avatarUrl | string | 头像地址 |
| userDescription | string | 用户描述 |
| userPhone | string | 用户手机 |
| userEmail | string | 用户邮箱 |
| directLeaderCodes | array<string> | 直属领导编码集合 |
| grandLeaderCodes | array<string> | 隔级领导编码集合 |
| entryDate | string | 入职日期格式:yyyy-MM-ddd |
| resignationDate | string | 入职日期格式:yyyy-MM-ddd |
| title | string (1,2,3) | 职称:1初级、2中级、3高级 |
| qualification | string | 资质 |
| education | integer (1,2,3,4,5,6) (int32) | 学历:1博士、2硕士、3本科、4大专、5高中/中专、6初中及以下 |
| major | string | 专业 |
| idNumber | string | 证号 |
| idNumberType | integer (1,2,3,4) (int32) | 证类型:1身份证、2护照、3港澳通行证、4其他 |
| personRelations | array<PersonRelation> | 人员公司部门岗位关系 |
| personRelations[].companyCode | string | 公司编码,只支持大小写英文、数字、-_ |
| personRelations[].departmentCode | string | 部门编码,只支持大小写英文、数字、-_ |
| personRelations[].positionCode | string | 岗位编码,只支持大小写英文、数字、-_ |
| personRelations[].postDate | string | 上岗时间格式: yyyy-MM-dd |
| personRelations[].description | string | 关系描述 |
| personRelations[].isDefault | boolean | 是否默认,所有关系中只有一条关系是true,或者全部false |
#### Responses

**400**: Bad Request

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| message | string |  |
| detailMsg | string |  |
| targetService | string |  |
| data | object |  |

**500**: Internal Server Error

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| message | string |  |
| detailMsg | string |  |
| targetService | string |  |
| data | object |  |

**200**: OK

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| message | string |  |
| detailMsg | string |  |
| targetService | string |  |
| data | object |  |

---

### DELETE /people/{codes}

**删除人员**

删除人员,删除离职的人员数据,最多删除200个编码的数据.

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| codes | path | array<string> | 是 | 人员编码集合 |

#### Responses

**400**: Bad Request

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| message | string |  |
| detailMsg | string |  |
| targetService | string |  |
| data | object |  |

**500**: Internal Server Error

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| message | string |  |
| detailMsg | string |  |
| targetService | string |  |
| data | object |  |

**200**: OK

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| message | string |  |
| detailMsg | string |  |
| targetService | string |  |
| data | object |  |

---


## 部门API

### GET /departments/{code}

**根据编码查询单个部门**

根据编码查询单个部门信息以及部门管理员信息

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| code | path | string | 是 | 部门编码 |

#### Responses

**400**: Bad Request

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| message | string |  |
| detailMsg | string |  |
| targetService | string |  |
| data | object |  |

**500**: Internal Server Error

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| message | string |  |
| detailMsg | string |  |
| targetService | string |  |
| data | object |  |

**200**: OK

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| message | string |  |
| detailMsg | string |  |
| targetService | string |  |
| data | Department | 部门 |
| data.id | integer (int64) | 部门ID |
| data.code | string | 部门编码 |
| data.name | string | 部门名称 |
| data.type | integer (int32) | 部门类型1普通部门 2应急部门 |
| data.parentId | integer (int64) | 上级部门id如果是公司则为空 |
| data.parentCode | string | 上级部门编码 |
| data.parentName | string | 上级部门名称 |
| data.parentFullPath | string | 上级部门全路径 |
| data.companyId | integer (int64) | 所属公司id |
| data.companyName | string | 部门id |
| data.companyCode | string | 部门code |
| data.description | string | 部门描述 |
| data.fullPath | string | 全路径 |
| data.leaf | boolean | 是否是叶子节点 |
| data.managerIds | array<integer> |  负责人id集合 |
| data.managers | array<DepartmentManager> | 负责人集合 |
| data.managers[].id | integer (int64) | 人员id |
| data.managers[].name | string | 人员名称 |
| data.managers[].code | string | 人员code |
| data.managers[].status | integer (int32) | 人员状态 |
| data.layNo | integer (int32) | 层级 |
| data.layRec | string | id全路经 |
| data.status | integer (int32) | 状态0停用1启用 |
| data.childrenCount | integer (int64) | 部门子部门数量 |

---

### PUT /departments/{code}

**根据编码修改部门**

根据编码修改对应部门的基础信息以及部门负责人

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| code | path | string | 是 | 部门编码 |

#### Request Body

| 字段 | 类型 | 说明 |
|------|------|------|
| code | string | 部门编码,只支持大小写英文、数字、-_ |
| name | string | 部门名称 |
| companyCode | string | 所属公司编码 |
| parentCode | string | 父级部门编码,输入后会去校验上级部门是否存在 |
| description | string | 部门描述 |
| type | integer (int32) | 类型: 1普通部门 2应急部门 |
| managerCodes | array<string> | 负责人编码集合,填入人员编码,会去校验人员是否存在 |
#### Responses

**400**: Bad Request

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| message | string |  |
| detailMsg | string |  |
| targetService | string |  |
| data | object |  |

**500**: Internal Server Error

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| message | string |  |
| detailMsg | string |  |
| targetService | string |  |
| data | object |  |

**200**: OK


---

### PUT /departments/{code}/status

**修改部门状态**

根据编码修改部门的启用/停用状态

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| code | path | string | 是 | 部门编码 |

#### Request Body

| 字段 | 类型 | 说明 |
|------|------|------|
| status | integer (int32) | 部门状态:0停用,1启用 |
#### Responses

**400**: Bad Request

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| message | string |  |
| detailMsg | string |  |
| targetService | string |  |
| data | object |  |

**500**: Internal Server Error

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| message | string |  |
| detailMsg | string |  |
| targetService | string |  |
| data | object |  |

**200**: OK

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| message | string |  |
| detailMsg | string |  |
| targetService | string |  |
| data | object |  |

---

### GET /departments

**分页查询部门**

分页查询部门,根据名字、编码、状态等条件分页查询部门信息

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| name | query | string | 否 | 部门名字,支持模糊匹配 |
| code | query | string | 否 | 部门编码,支持模糊匹配 |
| brief | query | boolean | 否 | 简单查询,设置为true的时候不会去查询创建者,修改者名称,不会去查询第三方系统的数据 |
| codes | query | array<string> | 否 | 部门编码集合 |
| current | query | integer | 否 | 当前页 |
| pageSize | query | integer | 否 | 每页行 |
| status | query | integer | 否 | 部门状态0停用,1启用 |

#### Responses

**400**: Bad Request

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| message | string |  |
| detailMsg | string |  |
| targetService | string |  |
| data | object |  |

**500**: Internal Server Error

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| message | string |  |
| detailMsg | string |  |
| targetService | string |  |
| data | object |  |

**200**: OK

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| message | string |  |
| detailMsg | string |  |
| targetService | string |  |
| pagination | Pagination |  |
| pagination.total | integer (int32) |  |
| pagination.current | integer (int32) |  |
| pagination.pageSize | integer (int32) |  |
| pagination.countTotal | boolean |  |
| list | array<Department> |  |
| list[].id | integer (int64) | 部门ID |
| list[].code | string | 部门编码 |
| list[].name | string | 部门名称 |
| list[].type | integer (int32) | 部门类型1普通部门 2应急部门 |
| list[].parentId | integer (int64) | 上级部门id如果是公司则为空 |
| list[].parentCode | string | 上级部门编码 |
| list[].parentName | string | 上级部门名称 |
| list[].parentFullPath | string | 上级部门全路径 |
| list[].companyId | integer (int64) | 所属公司id |
| list[].companyName | string | 部门id |
| list[].companyCode | string | 部门code |
| list[].description | string | 部门描述 |
| list[].fullPath | string | 全路径 |
| list[].leaf | boolean | 是否是叶子节点 |
| list[].managerIds | array<integer> |  负责人id集合 |
| list[].managers | array<DepartmentManager> | 负责人集合 |
| list[].managers[].id | integer (int64) | 人员id |
| list[].managers[].name | string | 人员名称 |
| list[].managers[].code | string | 人员code |
| list[].managers[].status | integer (int32) | 人员状态 |
| list[].layNo | integer (int32) | 层级 |
| list[].layRec | string | id全路经 |
| list[].status | integer (int32) | 状态0停用1启用 |
| list[].childrenCount | integer (int64) | 部门子部门数量 |

---

### POST /departments

**新增部门**

新增部门,此接口会发送部门新增事件,如果指定部门管理员,会去员工表校验员工编码是否存在,如果指定上级编码会去校验上级部门是否存在.

#### Request Body

| 字段 | 类型 | 说明 |
|------|------|------|
| code | string | 部门编码,只支持大小写英文、数字、-_ |
| name | string | 部门名称 |
| companyCode | string | 所属公司编码 |
| parentCode | string | 父级部门编码,输入后会去校验上级部门是否存在 |
| description | string | 部门描述 |
| type | integer (int32) | 类型1普通部门 2应急部门 |
| managerCodes | array<string> | 负责人编码集合,填入人员编码,会去校验人员是否存在 |
#### Responses

**400**: Bad Request

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| message | string |  |
| detailMsg | string |  |
| targetService | string |  |
| data | object |  |

**500**: Internal Server Error

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| message | string |  |
| detailMsg | string |  |
| targetService | string |  |
| data | object |  |

**200**: OK

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| message | string |  |
| detailMsg | string |  |
| targetService | string |  |
| data | object |  |

---

### DELETE /departments/{codes}

**根据编码批量删除部门**

根据编码修改对应部门的基础信息以及部门负责人

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| codes | path | array<string> | 是 | 部门编码 |

#### Responses

**400**: Bad Request

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| message | string |  |
| detailMsg | string |  |
| targetService | string |  |
| data | object |  |

**500**: Internal Server Error

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| message | string |  |
| detailMsg | string |  |
| targetService | string |  |
| data | object |  |

**200**: OK


---


## 公司API

### GET /companies/{code}

**根据编码查询单个公司**

根据编码查询单个公司,此接口会去用户认证服务实时查询创建人,修改人的名字

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| code | path | string | 是 | 公司编码 |

#### Responses

**400**: Bad Request

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| message | string |  |
| detailMsg | string |  |
| targetService | string |  |
| data | object |  |

**500**: Internal Server Error

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| message | string |  |
| detailMsg | string |  |
| targetService | string |  |
| data | object |  |

**200**: OK

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| message | string |  |
| detailMsg | string |  |
| targetService | string |  |
| data | Company | 公司 |
| data.id | integer (int64) | 公司ID |
| data.code | string | 公司编码 |
| data.description | string | 描述 |
| data.shortName | string | 集团或公司简称 |
| data.fullName | string | 集团或公司全称 |
| data.address | string | 集团或公司地址 |
| data.tags | array<string> | 公司标签 |
| data.managerUserId | integer (int64) | 管理用户ID |
| data.orgManager | OrgManager | 公司管理员 |
| data.orgManager.personId | integer (int64) | 人员id |
| data.orgManager.userName | string | 名称 |
| data.orgManager.password | string |  密码 |
| data.orgManager.userType | integer (int32) | 用户类型1普通用户 2管理员 |
| data.orgManager.userId | integer (int64) | 用户ID |
| data.status | integer (int32) | 状态 |

---

### PUT /companies/{code}

**修改公司**

根据编码修改公司基础,此接口会发送公司变更事件.

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| code | path | string | 是 | 公司编码 |

#### Request Body

| 字段 | 类型 | 说明 |
|------|------|------|
| shortName | string | 集团或公司简称 |
| fullName | string | 集团或公司全称 |
| description | string | 描述 |
| tags | array<string> | 标签 |
#### Responses

**400**: Bad Request

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| message | string |  |
| detailMsg | string |  |
| targetService | string |  |
| data | object |  |

**500**: Internal Server Error

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| message | string |  |
| detailMsg | string |  |
| targetService | string |  |
| data | object |  |

**200**: OK

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| message | string |  |
| detailMsg | string |  |
| targetService | string |  |
| data | object |  |

---

### GET /companies

**分页查询公司**

分页查询公司,此接口会去用户认证服务批量实时查询创建人,修改人的名字

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| code | query | string | 否 | 公司编码 |
| name | query | string | 否 | 公司名字 |
| current | query | integer | 否 | 当前页 |
| pageSize | query | integer | 否 | 每页行 |

#### Responses

**400**: Bad Request

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| message | string |  |
| detailMsg | string |  |
| targetService | string |  |
| data | object |  |

**500**: Internal Server Error

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| message | string |  |
| detailMsg | string |  |
| targetService | string |  |
| data | object |  |

**200**: OK

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| message | string |  |
| detailMsg | string |  |
| targetService | string |  |
| pagination | Pagination |  |
| pagination.total | integer (int32) |  |
| pagination.current | integer (int32) |  |
| pagination.pageSize | integer (int32) |  |
| pagination.countTotal | boolean |  |
| list | array<Company> |  |
| list[].id | integer (int64) | 公司ID |
| list[].code | string | 公司编码 |
| list[].description | string | 描述 |
| list[].shortName | string | 集团或公司简称 |
| list[].fullName | string | 集团或公司全称 |
| list[].address | string | 集团或公司地址 |
| list[].tags | array<string> | 公司标签 |
| list[].managerUserId | integer (int64) | 管理用户ID |
| list[].orgManager | OrgManager | 公司管理员 |
| list[].orgManager.personId | integer (int64) | 人员id |
| list[].orgManager.userName | string | 名称 |
| list[].orgManager.password | string |  密码 |
| list[].orgManager.userType | integer (int32) | 用户类型1普通用户 2管理员 |
| list[].orgManager.userId | integer (int64) | 用户ID |
| list[].status | integer (int32) | 状态 |

---

### POST /companies

**新增公司**

创建公司,此接口会发送公司新增事件,并且会去用户认证服务添加公司管理员用户,当前系统只能创建一条公司数据.

#### Request Body

| 字段 | 类型 | 说明 |
|------|------|------|
| code | string | 公司编码,只支持大小写英文、数字、-_ |
| shortName | string | 集团或公司简称 |
| fullName | string | 集团或公司全称 |
| userName | string | 管理员用户名 |
| password | string | 管理员密码 |
| description | string | 描述 |
| tags | array<string> | 标签 |
#### Responses

**400**: Bad Request

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| message | string |  |
| detailMsg | string |  |
| targetService | string |  |
| data | object |  |

**500**: Internal Server Error

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| message | string |  |
| detailMsg | string |  |
| targetService | string |  |
| data | object |  |

**200**: OK

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| message | string |  |
| detailMsg | string |  |
| targetService | string |  |
| data | object |  |

---

### GET /companies/default

**获取当前用户的默认公司**

当用户如果绑定关系可以获取对应默认企业,如果没有关联公司的时候,则获取第一个创建的默认公司

#### Responses

**400**: Bad Request

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| message | string |  |
| detailMsg | string |  |
| targetService | string |  |
| data | object |  |

**500**: Internal Server Error

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| message | string |  |
| detailMsg | string |  |
| targetService | string |  |
| data | object |  |

**200**: OK

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) |  |
| message | string |  |
| detailMsg | string |  |
| targetService | string |  |
| data | Company | 公司 |
| data.id | integer (int64) | 公司ID |
| data.code | string | 公司编码 |
| data.description | string | 描述 |
| data.shortName | string | 集团或公司简称 |
| data.fullName | string | 集团或公司全称 |
| data.address | string | 集团或公司地址 |
| data.tags | array<string> | 公司标签 |
| data.managerUserId | integer (int64) | 管理用户ID |
| data.orgManager | OrgManager | 公司管理员 |
| data.orgManager.personId | integer (int64) | 人员id |
| data.orgManager.userName | string | 名称 |
| data.orgManager.password | string |  密码 |
| data.orgManager.userType | integer (int32) | 用户类型1普通用户 2管理员 |
| data.orgManager.userId | integer (int64) | 用户ID |
| data.status | integer (int32) | 状态 |

---

