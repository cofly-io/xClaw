# 文件服务

**版本**: v0  
**OpenAPI**: 3.0.0

---
# basePath：/os/open-api/file-server

## 文件服务接口

### GET /v2/groups/{groupId}/files/{fileUuid}

**下载文件**

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| groupId | path | string | 是 | 分组Id |
| fileUuid | path | string | 是 | 文件UUID，上传文件时返回的UUID |
| contentDisposition | query | string (inline, attachment) | 否 | 文件响应处理方式, inline-表示建议浏览器直接预览响应内容，attachment-表示建议浏览器直接弹出下载窗口 |

#### Responses

**200**: 下载文件成功，以二进制数据返回文件流


**400**: 请求参数错误

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误代码 |
| message | string | 错误消息 |
| detailMsg | string | 错误详情信息 |
| timestamp | string (date-time) | 错误发生时间 |

---

### DELETE /v2/groups/{groupId}/files/{fileUuid}

**删除文件**

删掉文件，如果文件被发布为静态资源，则静态资源将同时删除

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| groupId | path | string | 是 | 分组Id |
| fileUuid | path | string | 是 | 文件UUID，上传文件时返回的UUID |

#### Responses

**204**: 删除文件成功


**400**: 请求参数错误

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误代码 |
| message | string | 错误消息 |
| detailMsg | string | 错误详情信息 |
| timestamp | string (date-time) | 错误发生时间 |

---

### POST /v2/groups/{groupId}/files

**上传文件**

上传文件，可选择将文件发布为静态资源。无论static参数为何值，都返回文件UUID，用于后续下载和删除操作。如果static参数为true，文件同时会发布为静态资源，可通过/os/static/runtime/{group}/{filePath}直接访问

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| groupId | path | string | 是 | 分组Id |
| static | query | boolean | 否 | 是否静态资源，静态资源可以通过/os/static/runtime/{group}/{filePath}直接访问,不需要鉴权,默认false |
| preview | query | boolean | 否 | 是否需要生成缩略图, 会在原文件同级下自动生成一个带有-compress后缀的图片，例如1.png会生成一个1-compress.png, 支持格式：jpg,jpeg,gif,bmp,png,默认false |
| filePath | query | string | 是 | 完整文件路径（包含目录和文件名），例如：demo/images/head.ico 最大长度支持300字符，不支持以/结尾，不支持特殊字符：[;|*~] |

#### Request Body

#### Responses

**200**: 上传文件成功，返回文件UUID

| 字段 | 类型 | 说明 |
|------|------|------|
| data | object |  |
| data.fileUuid | string (uuid) | 文件UUID，用于后续下载和删除操作 |

**400**: 请求参数错误

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误代码 |
| message | string | 错误消息 |
| detailMsg | string | 错误详情信息 |
| timestamp | string (date-time) | 错误发生时间 |

---

### GET /v2/groups/{groupId}/files

**查询分组下文件列表**

根据条件分页查询分组历史上传的所有文件，返回文件路径和UUID列表

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| groupId | path | string | 是 | 分组Id |
| current | query | integer | 否 | 页码 |
| pageSize | query | integer | 否 | 每页条数 |

#### Responses

**200**: 查询成功，返回分页文件列表（包含路径和UUID）

| 字段 | 类型 | 说明 |
|------|------|------|
| pagination | object | 分页信息 |
| pagination.total | integer | 总记录数 |
| pagination.current | integer | 当前页码 |
| pagination.pageSize | integer | 每页条数 |
| list | array<FileInfo> | 文件信息列表 |
| list[].filePath | string | 文件路径 |
| list[].fileUuid | string (uuid) | 文件UUID，用于下载和删除操作 |

**400**: 请求参数错误

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (int32) | 错误代码 |
| message | string | 错误消息 |
| detailMsg | string | 错误详情信息 |
| timestamp | string (date-time) | 错误发生时间 |

---

