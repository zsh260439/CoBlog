# 登录鉴权复习总览

这份文档基于你当前项目的真实实现整理，目标不是背代码，而是把整条链路和每个函数的职责记清楚。

## 1. 当前登录鉴权架构

当前项目采用的是：

- 后端：`NestJS + MongoDB + JWT + bcrypt`
- 前端：`Vue + axios + localStorage + cookie(refreshToken)`
- 模式：`accessToken + refreshToken` 双 token 模式

## 2. 你当前实现里的关键模块

### 后端 auth 模块

- `server/src/auth/schema/auth.schema.ts`
- `server/src/auth/dto/login.dto.ts`
- `server/src/auth/auth.service.ts`
- `server/src/auth/auth.controller.ts`
- `server/src/auth/auth.guard.ts`
- `server/src/auth/auth.module.ts`

### 前端 auth 相关模块

- `client/src/views/Login.vue`
- `client/src/servers/auth.ts`
- `client/src/http-utils/index.ts`
- `client/src/router/index.ts`
- `client/src/composables/useAuth.ts`

## 3. 你必须牢记的 8 个核心概念

### 3.1 `schema`

定义数据库表结构。

当前登录表字段：

- `username`
- `password`
- `role`
- `refreshToken`

### 3.2 `dto`

定义接口参数校验规则。

当前登录 DTO 会校验：

- `username` 不能为空
- `password` 不能为空
- `password` 最少 6 位

### 3.3 `service`

写业务逻辑。

当前 auth service 负责：

- 查数据库验证用户
- `bcrypt.compare` 校验密码
- 生成 `accessToken`
- 生成 `refreshToken`
- 把 refreshToken 哈希写回数据库
- refresh 时重新签发一对 token
- logout 时把数据库里的 refreshToken 清空

### 3.4 `controller`

接收请求并返回响应。

当前 auth controller 负责：

- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`

### 3.5 `guard`

保护需要登录才能访问的接口。

当前 `AuthGuard` 检查：

- 有没有 `Authorization`
- 是否为 `Bearer token`
- `accessToken` 是否能通过 JWT 验证

### 3.6 `accessToken`

短令牌。

作用：

- 访问受保护接口
- 由前端每次请求时放进 `Authorization: Bearer xxx`

当前代码中有效期：`10s`

### 3.7 `refreshToken`

长令牌。

作用：

- 在 `accessToken` 过期后换新的 `accessToken`

当前代码中有效期：`30s`

### 3.8 `Bearer`

请求头中的固定前缀。

格式：

```http
Authorization: Bearer accessToken
```

## 4. 你项目里每个函数的职责

### 4.1 后端 `auth.schema.ts`

#### `Login`

作用：定义登录表结构。

#### `LoginSchema`

作用：把类转换成 mongoose schema，供模块注册。

---

### 4.2 后端 `auth.service.ts`

#### `validateUser(loginDto)`

作用：验证登录用户是否存在，以及密码是否正确。

流程：

1. 取出 `username` 和 `password`
2. 根据 `username` 查数据库
3. 如果查不到，抛 `UnauthorizedException('用户名不存在!')`
4. 用 `bcrypt.compare(password, user.password)` 校验密码
5. 如果密码不对，抛 `UnauthorizedException('密码错误!')`
6. 返回 `user`

#### `generateTokens(user)`

作用：根据当前用户生成双 token。

返回：

- `accessToken`
- `refreshToken`

#### `login(loginDto)`

作用：完整执行登录。

流程：

1. 调 `validateUser()`
2. 调 `generateTokens()`
3. 把 `refreshToken` 用 `bcrypt.hash()` 加密
4. 更新数据库中的 `refreshToken`
5. 返回：
   - `accessToken`
   - `refreshToken`
   - `user`

#### `refreshToken(userId, refreshToken)`

作用：用旧的 `refreshToken` 换新的一对 token。

流程：

1. 根据 `userId` 查用户
2. 检查数据库里是否有 refreshToken 哈希
3. 用 `bcrypt.compare()` 比对前端带来的 refreshToken 和数据库哈希
4. 如果不匹配，抛 `UnauthorizedException('RefreshToken无效!')`
5. 重新生成新的双 token
6. 把新的 refreshToken 哈希重新写回数据库
7. 返回新的：
   - `accessToken`
   - `refreshToken`

#### `logout(userId)`

作用：销毁当前用户在数据库中的 refreshToken。

流程：

1. 根据用户 id 更新数据库
2. 把 `refreshToken` 设为空字符串
3. 返回成功结果

---

### 4.3 后端 `auth.controller.ts`

#### `login()`

作用：登录接口。

流程：

1. 调 `authService.login()`
2. 把 `refreshToken` 写入 cookie
3. 只把 `accessToken` 和 `user` 返回给前端

#### `refresh()`

作用：刷新短令牌。

流程：

1. 从 cookie 中读取 `refresh_token`
2. 如果没有，抛 `UnauthorizedException('缺少refreshToken')`
3. 用 `JwtService.verifyAsync()` 验证 refreshToken 自身是否过期
4. 调 `authService.refreshToken(userId, refreshToken)`
5. 返回新的 `accessToken`
6. 同时把新的 `refreshToken` 再写进 cookie

#### `logout()`

作用：退出登录。

流程：

1. 先通过 `AuthGuard`
2. 从 `request.user` 拿到当前用户信息
3. 调 `authService.logout()` 清数据库 refreshToken
4. `clearCookie('refresh_token')`
5. 返回退出成功

---

### 4.4 后端 `auth.guard.ts`

#### `canActivate(context)`

作用：拦截受保护接口。

流程：

1. 读取 `request.headers.authorization`
2. 如果没有，抛 `未登录!`
3. 拆分 `Bearer token`
4. 如果前缀不对或 token 缺失，抛 `Token无效!`
5. 用 `JwtService.verifyAsync(token, JWT_SECRET)` 验证 accessToken
6. 验证通过后把 `payload` 挂到 `request.user`
7. 返回 `true`

---

### 4.5 前端 `Login.vue`

#### `handleSubmit()`

作用：执行登录提交。

流程：

1. 校验用户名密码是否为空
2. 调 `login()`
3. 从返回结果中取 `result.data?.accessToken`
4. 如果没有 token，抛错
5. 保存到 `localStorage`
6. 提示“登录成功”
7. 跳转 `/admin`

---

### 4.6 前端 `http-utils/index.ts`

#### `httpInstance`

作用：普通业务请求实例。

特点：

- 自动带 `Bearer accessToken`
- 处理普通接口 `401`

#### `authHttpInstance`

作用：认证专用请求实例。

特点：

- 不参与 401 自动 refresh 逻辑
- 只用于 `login / refresh / logout`

#### `request()`

作用：给普通业务接口用。

#### `authRequest()`

作用：给登录、刷新、退出用。

#### 普通请求拦截器

作用：自动把 `local-token` 加到请求头里。

#### 普通响应拦截器

作用：处理 `401 -> refresh -> 重发原请求`

详细流程：

1. 普通接口返回 `401`
2. 如果当前没有正在 refresh，则进入 refresh
3. 调 `authRequest('/auth/refresh')`
4. 成功拿到新的 `accessToken`
5. 更新本地 `local-token`
6. 把排队的请求全部重放
7. 当前原始请求也重新发送
8. 如果 refresh 失败：
   - 删除本地 token
   - 弹提示
   - 跳转 `/login`

---

### 4.7 前端 `router/index.ts`

#### `beforeEach()`

作用：切换后台路由前，主动检查 `accessToken` 是否过期。

流程：

1. 读取本地 `local-token`
2. 判断是不是后台路由 `/admin`
3. 如果不是后台路由，直接放行
4. 如果是后台路由但没 token，跳 `/login`
5. 如果 token 没过期，直接放行
6. 如果 token 过期：
   - 调 `authRequest('/auth/refresh')`
   - 成功则更新本地 token，继续放行
   - 失败则删本地 token，提示并跳 `/login`

---

### 4.8 前端 `useAuth.ts`

#### `isAccessTokenExpired(token)`

作用：读取 JWT payload 中的 `exp`，判断 accessToken 是否过期。

流程：

1. 用 `jwtDecode<JwtPayload>(token)` 解码
2. 如果没有 `exp`，默认视为过期
3. 如果 `payload.exp * 1000 <= Date.now() + 3000`
   说明已过期或即将过期

## 5. 你这两天遇到的高频难点与疑点

### 难点 1：为什么登录页能成功，但 token 取不到

根因：前后端返回结构层级不一致。

你后端统一返回的是：

```json
{
  "code": 0,
  "message": "登录成功",
  "data": {
    "accessToken": "xxx"
  }
}
```

所以前端应该取：

```ts
result.data?.accessToken
```

前提是对应的请求实例已经通过响应拦截器把 `AxiosResponse` 的外层 `.data` 解开了。

---

### 难点 2：为什么 `authRequest` 不写 401 自动 refresh

因为 `/auth/refresh` 如果自己失败再进入同一套 refresh 逻辑，会无限递归。

所以：

- `request` 负责 401 自动刷新
- `authRequest` 只负责纯粹请求认证接口

---

### 难点 3：为什么一开始切路由感觉检测不到 accessToken

因为最初路由守卫只检查：

```ts
localStorage.getItem('local-token')
```

只看“有没有”，不看“过没过期”。

后来补上：

```ts
isAccessTokenExpired(token)
```

才真正具备了切后台前主动检查短 token 过期的能力。

---

### 难点 4：为什么 refreshToken 过期了，看起来不容易察觉

因为 refreshToken 只有在你真正调用 `/auth/refresh` 时才会被检查。

它不是前端定时器自动检查的，而是：

- accessToken 过期
- 触发 refresh
- refresh 时后端才会发现 refreshToken 也过期了

---

### 难点 5：为什么数据库要存 refreshToken 哈希

因为 logout 或 refresh 轮换时，需要控制 refreshToken 是否仍然有效。

数据库保存哈希值的作用：

- refresh 时做匹配比对
- logout 时失效当前 refreshToken
- 避免明文 refreshToken 泄露风险

---

### 难点 6：为什么不是一个 token 就够了

一个 token 的方案也能跑，但用户体验差：

- token 过期后必须重新登录

双 token 的意义是：

- `accessToken` 短，负责接口安全
- `refreshToken` 长，负责无感续期

---

## 6. 登录全过程详细流程图（文字版）

详见同目录下：`LOGIN-FLOW.md`

## 7. 刷新全过程详细流程图（文字版）

详见同目录下：`REFRESH-FLOW.md`

## 8. 退出登录全过程详细流程图（文字版）

详见同目录下：`LOGOUT-FLOW.md`

## 9. 最后你真正要记住的不是所有代码，而是这些骨架

### 登录骨架

1. 前端提交账号密码
2. 后端查数据库用户
3. bcrypt 校验密码
4. 生成双 token
5. accessToken 给前端
6. refreshToken 写 cookie

### 鉴权骨架

1. 前端普通请求带 Bearer accessToken
2. 后端 AuthGuard 校验 accessToken
3. 失败返回 401

### 无感刷新骨架

1. accessToken 过期
2. 前端收到 401 或切后台路由时主动发现已过期
3. 调 `/auth/refresh`
4. refreshToken 合法则返回新的 accessToken
5. 前端更新本地 token 并重试
6. refreshToken 失效则跳登录页

### 退出骨架

1. 前端点退出
2. 调 `/auth/logout`
3. 后端清数据库 refreshToken
4. 后端清 cookie
5. 前端清本地 token
6. 跳登录页
