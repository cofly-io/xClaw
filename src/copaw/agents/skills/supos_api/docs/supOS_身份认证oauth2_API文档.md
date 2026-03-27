# 身份认证

**版本**: 1.0.0  
**OpenAPI**: 3.0.3

---
# basePath：/os/open-api/auth/v1/

## OAuth2

### GET /oauth2/authorize

**获取授权**

支持的授权模式：
* **授权码模式（Authorization Code Grant）**：
  - `responseType=code`：客户端应用程序请求一个授权码。授权码可以用来在令牌端点换取授权令牌。通常用于服务器端应用程序，因为它涉及将授权码发送到服务器端。:
    - 1、请求包含cookie: suposTicket，直接跳转至redirectUri地址
    - 2、请求不包含cookie，则跳转至supOS登录页面，登录后跳转至redirectUri地址


#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| responseType | query | string (code) | 是 | * 对于授权码模式，设置为code。
 |
| redirectUri | query | string | 是 | * 授权回调地址
* 必须是一个绝对URI            
* 用于重定向到客户端程序，告知授权码
* 包含特殊字符~!@#$&*()=:/,;?+'等，请用encodeURIComponent进行编码
 |
| state | query | string | 否 | * 用于维持请求和回调过程中的状态，防止CSRF攻击，服务器不对该参数做任何处理。
* 如果客户端携带了该参数，则服务器在响应时原封不动的返回。
 |

#### Responses

**302**: 根据`responseType`参数的不同，授权端点会重定向到指定的`redirectUri`，并附带授权码或访问令牌：
  1. **授权码模式**（`responseType=code`）：
     - 重定向到 `redirectUri`，并在query参数中附带授权码和可选的 `state` 参数。
     - 示例：`https://yourapp.com/callback?code=xxxxxxxx&state=xxxxxx`



**400**: * 100106500 请求缺少必要的参数1


| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer | 错误码 |
| message | string | 错误描述信息 |

---

### POST /oauth2/token

**令牌端点**

令牌端点的主要功能是：
  1. **授权码获取授权令牌**：
     - 传递授权码到令牌端点，验证通过返回授权令牌。
  2. **刷新令牌获取授权令牌**:
     - 传递刷新令请求令牌端点，验证通过返回授权令牌。


#### Request Body

| 字段 | 类型 | 说明 |
|------|------|------|
| code | string | * 当grantType=authorizationCode，该字段必录
* 其值就是授权端点接口返回的授权码
 |
| grantType | string (authorization_code, refresh_token) | *  用于指定客户端正在使用的授权类型的参数。以下是OAuth 2.0标准中常用的 grantType 值：
*  **`authorization_code`**
   - 适用于授权码授权流程（Authorization Code Grant）。这种授权类型通常用于服务器端应用程序，首先通过授权码进行身份验证，然后在令牌端点交换令牌。
* **`refresh_token`**
   - 适用于刷新令牌流程（Refresh Token Grant）。当授权令牌过期时，客户端可以使用刷新令牌获取一个新的授权令牌，而无需重新进行授权。
 |
| logoutUri | string | * 当grantType=authorization_code，该字段才有效
* 该字段非必录, 当录入，录入是第三方应用地址, 代表会话失效，通知第三方         
* 当前只支持get方法  
* 通知第三方接口格式：logoutUri?accessToken=xxxxx
 |
| accessToken | string | * 当grantType=refresh_token，该字段必录
* 录入值为accessToken
 |
| refreshToken | string | * 当grantType=refresh_token，该字段必录
* 录入值为refreshToken
 |
#### Responses

**200**: OK

| 字段 | 类型 | 说明 |
|------|------|------|
| data | OAuthToken |  |
| data.accessToken | string | 授权令牌。 |
| data.refreshToken | string | 刷新令牌，可用于获取新的访问令牌。 |
| data.expiresIn | integer | 授权令牌的有效期（秒）。 |
| data.tokenType | string (Bearer) | 令牌类型。 |
| data.username | string | 用户名称 |
| data.personCode | string | 人员编号 |
| data.companyCode | string | 公司编号 |
| data.accountType | integer | 账号类型(1 普通用户,2 管理员) |

**400**: 错误提示
* 100106500 请求缺少grantType参数


| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer | 错误码 |
| message | string | 错误描述信息 |

---

