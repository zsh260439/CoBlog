# 登录全过程流程图（详细版）

## 1. 前端触发入口

文件：`client/src/views/Login.vue`

函数：`handleSubmit()`

### 步骤

1. 用户输入 `username` 和 `password`
2. 点击登录按钮
3. 执行 `handleSubmit()`
4. 前端先做基础校验：
   - 用户名不能为空
   - 密码不能为空
5. 调用：

```ts
login({ username, password })
```

---

## 2. 前端请求封装层

文件：`client/src/servers/auth.ts`

函数：`login()`

### 步骤

1. `login()` 调用 `request('/auth/login', 'POST', payload)`
2. 请求进入 `client/src/http-utils/index.ts`
3. 实际由 `httpInstance` 发出请求

---

## 3. 后端 controller 层

文件：`server/src/auth/auth.controller.ts`

函数：`login()`

### 步骤

1. 接收 `POST /auth/login`
2. 接收请求体 `LoginDto`
3. 调用：

```ts
this.authService.login(loginDto)
```

---

## 4. 后端 service 层：验证用户

文件：`server/src/auth/auth.service.ts`

函数：`validateUser(loginDto)`

### 步骤

1. 取出 `username` 和 `password`
2. 查库：

```ts
this.loginModel.findOne({ username })
```

3. 如果没找到用户，抛：

```ts
UnauthorizedException('用户名不存在!')
```

4. 如果找到用户，开始比对密码：

```ts
bcrypt.compare(password, user.password)
```

5. 如果密码不匹配，抛：

```ts
UnauthorizedException('密码错误!')
```

6. 如果通过，返回 `user`

---

## 5. 后端 service 层：生成双 token

文件：`server/src/auth/auth.service.ts`

函数：`generateTokens(user)`

### 步骤

1. 构造 payload：

```ts
{
  userId,
  username,
  role
}
```

2. 生成 `accessToken`
3. 生成 `refreshToken`
4. 返回双 token

---

## 6. 后端 service 层：保存 refreshToken 哈希

文件：`server/src/auth/auth.service.ts`

函数：`login()`

### 步骤

1. 调 `generateTokens()` 获取双 token
2. 用 `bcrypt.hash(refreshToken, 10)` 加密 refreshToken
3. 更新数据库中的 `refreshToken`
4. 返回：
   - `accessToken`
   - `refreshToken`
   - `user`

---

## 7. 后端 controller：写 cookie 并响应前端

文件：`server/src/auth/auth.controller.ts`

函数：`login()`

### 步骤

1. 把 `refreshToken` 写入 cookie：

```ts
response.cookie('refresh_token', data.refreshToken, ...)
```

2. 返回 JSON：

```ts
ApiResponse.success({
  accessToken,
  user
}, '登录成功')
```

---

## 8. 前端收到响应后

文件：`client/src/views/Login.vue`

函数：`handleSubmit()`

### 步骤

1. 取 `result.data?.accessToken`
2. 如果为空，报错
3. 保存到本地：

```ts
localStorage.setItem('local-token', token)
```

4. 弹出“登录成功”
5. `router.push('/admin')`

---

## 9. 登录结束后浏览器中的状态

### localStorage 中有

- `local-token` = accessToken

### cookie 中有

- `refresh_token` = refreshToken

### 数据库中有

- `refreshToken` 的哈希值

---

## 10. 登录完成后的职责分配

- `accessToken`
  - 前端保存
  - 请求普通受保护接口时带上

- `refreshToken`
  - 浏览器 cookie 保存
  - 前端不直接读取
  - 只在 refresh 接口时由浏览器自动携带
