# 刷新令牌全过程流程图（详细版）

## 1. 触发入口有两种

### 入口 A：普通业务请求 401

文件：`client/src/http-utils/index.ts`

### 入口 B：切后台路由时，前端主动发现 accessToken 已过期

文件：`client/src/router/index.ts`

---

## 2. 情况 A：普通请求触发 refresh

### 前端流程

1. 普通业务请求通过 `request()` 发出
2. `httpInstance` 自动带 `Bearer accessToken`
3. 后端 `AuthGuard` 验证 accessToken
4. 如果 accessToken 过期，后端返回 `401`
5. `httpInstance` 的响应拦截器捕获 `401`
6. 如果当前没有正在 refresh，就调用：

```ts
authRequest('/auth/refresh', 'POST')
```

7. 如果 refresh 成功：
   - 拿到新的 `accessToken`
   - 更新 `localStorage`
   - 重放之前失败的请求
8. 如果 refresh 失败：
   - 删除 `local-token`
   - 跳转 `/login`

---

## 3. 情况 B：切后台路由主动 refresh

### 前端流程

文件：`client/src/router/index.ts`

1. 进入 `router.beforeEach()`
2. 判断是不是 `/admin` 路由
3. 读取本地 `local-token`
4. 调 `isAccessTokenExpired(token)`
5. 如果 accessToken 已过期：
   - 调 `authRequest('/auth/refresh', 'POST')`
6. 如果 refresh 成功：
   - 更新本地 `local-token`
   - 放行后台路由
7. 如果 refresh 失败：
   - 删除 `local-token`
   - 跳 `/login`

---

## 4. 后端 `/auth/refresh` 的详细流程

文件：`server/src/auth/auth.controller.ts`

### controller 层

1. 接收 `POST /auth/refresh`
2. 从 cookie 中读：

```ts
request.cookies?.refresh_token
```

3. 如果没有 refreshToken，抛：

```ts
UnauthorizedException('缺少refreshToken')
```

4. 用 `JwtService.verifyAsync(refreshToken, JWT_REFRESH_SECRET)` 验证 refreshToken 自身是否合法、是否过期
5. 拿到 payload 中的 `userId`
6. 调：

```ts
authService.refreshToken(userId, refreshToken)
```

---

## 5. 后端 service 层的 refreshToken() 详细流程

文件：`server/src/auth/auth.service.ts`

1. 根据 `userId` 查数据库用户
2. 检查数据库里是否存在 `refreshToken` 哈希
3. 用 `bcrypt.compare(refreshToken, user.refreshToken)` 对比
4. 如果不匹配，抛：

```ts
UnauthorizedException('RefreshToken无效!')
```

5. 如果匹配，重新生成新的双 token：
   - 新 `accessToken`
   - 新 `refreshToken`
6. 把新的 refreshToken 哈希写回数据库
7. 返回新的双 token

---

## 6. 后端 refresh 成功后的响应

controller 层会：

1. 把新的 `refreshToken` 再写回 cookie
2. 只把新的 `accessToken` 返回前端

返回格式：

```json
{
  "code": 0,
  "message": "刷新成功",
  "data": {
    "accessToken": "新的短令牌"
  }
}
```

---

## 7. 你当前实现是滑动续期，不是绝对过期

这很重要。

当前逻辑中：

- refresh 成功后会重新生成新的 `refreshToken`
- 所以 `refreshToken` 的过期时间会重新开始计算

这意味着：

- 用户持续活跃时，refreshToken 会不断续命
- 只有在用户长时间不操作，超过 refreshToken 本轮有效期后，才会真正失效

---

## 8. 为什么有时候你感觉“refreshToken 不会过期”

不是没过期，而是：

- 每次 refresh 成功时
- 后端都重新签发新的 refreshToken

所以如果你一直在操作后台，它会不断续期。

---

## 9. 为什么切路由时以前感觉没反应

因为旧版本的路由守卫只检查有没有 token，不检查过期。

现在新的 `beforeEach` 已经补上：

- 先检查 accessToken 是否过期
- 过期就主动 refresh

这就是你这次补完后的核心改进。
