# 退出登录全过程流程图（详细版）

## 1. 前端触发退出

文件：`client/src/servers/auth.ts`

函数：`logout()`

当前设计里它负责请求：

```ts
POST /auth/logout
```

---

## 2. 为什么 logout 必须带 accessToken

因为后端 `logout` 接口被 `AuthGuard` 保护：

文件：`server/src/auth/auth.controller.ts`

```ts
@UseGuards(AuthGuard)
@Post('logout')
```

这意味着：

- 不带 `Authorization: Bearer accessToken`
- 后端不会允许你退出

---

## 3. 前端发起请求

正常情况下：

- `logout` 应该通过普通请求实例发出
- 这样请求拦截器才会自动带上 Bearer

如果走了不带 Bearer 的实例，就会 `401`。

---

## 4. 后端 `AuthGuard` 先验证 accessToken

文件：`server/src/auth/auth.guard.ts`

流程：

1. 读取 `Authorization`
2. 检查是否为 `Bearer token`
3. 验证 accessToken
4. 验证成功后把 payload 挂到 `request.user`

这一步成功后，controller 才会继续执行。

---

## 5. 后端 controller 层 logout

文件：`server/src/auth/auth.controller.ts`

流程：

1. 从 `request.user.userId` 取当前用户 id
2. 调：

```ts
authService.logout(userId)
```

3. 执行：

```ts
response.clearCookie('refresh_token')
```

4. 返回退出成功

---

## 6. 后端 service 层 logout

文件：`server/src/auth/auth.service.ts`

函数：`logout(userId)`

流程：

1. 根据用户 id 更新数据库
2. 把数据库里的 `refreshToken` 置为空字符串

```ts
await this.loginModel.findByIdAndUpdate(userId, {
  refreshToken: ''
})
```

3. 返回成功结果

---

## 7. 为什么 logout 要同时清数据库和 cookie

### 清数据库 refreshToken

作用：

- 即使旧 cookie 还残留，也不能再 refresh

### 清浏览器 cookie

作用：

- 浏览器后续不会再自动携带旧 refreshToken

两个动作都做，退出才完整。

---

## 8. 前端退出后还应该做什么

前端理想状态还应该：

1. 删除 `localStorage` 里的 `local-token`
2. 跳转到 `/login`

这部分如果你后面补一个“退出按钮”，一定要记住一起做。

---

## 9. 退出后系统状态应该变成什么样

### localStorage

- `local-token` 被清掉

### cookie

- `refresh_token` 被清掉

### 数据库

- `refreshToken` 变成空字符串

### 结果

- 后续受保护请求都会失败
- refresh 也不能再成功

这才叫真正退出。
