<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { login } from '@/servers/auth'

const router = useRouter()

const form = reactive({
  username: '',
  password: ''
})

const loading = ref(false)
const errorText = ref('')

const handleSubmit = async () => {
  errorText.value = ''

  if (!form.username.trim()) {
    errorText.value = '请输入账号'
    return
  }

  if (!form.password.trim()) {
    errorText.value = '请输入密码'
    return
  }

  loading.value = true

  try {
    const result = await login({
      username: form.username.trim(),
      password: form.password
    })

    // 后端登录接口返回的是 accessToken，refreshToken 已经放进 cookie
    const token = result.data?.accessToken

    if (!token) {
      throw new Error('未获取到 token')
    }
    localStorage.setItem('local-token',token)
    ElMessage.success('登录成功')
    router.push('/admin')
  } catch (error: any) {
    errorText.value =
      error?.response?.data?.message ||
      error?.message ||
      '登录失败，请检查账号密码'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-card__header">
        <p class="login-card__eyebrow">Admin Access</p>
        <h1>后台登录</h1>
        <p class="login-card__desc">登录后进入内容管理后台</p>
      </div>

      <form class="login-form" @submit.prevent="handleSubmit">
        <div class="login-form__field">
          <label>账号</label>
          <el-input
            v-model="form.username"
            size="large"
            placeholder="请输入账号"
            autocomplete="username"
          />
        </div>

        <div class="login-form__field">
          <label>密码</label>
          <el-input
            v-model="form.password"
            type="password"
            size="large"
            show-password
            placeholder="请输入密码"
            autocomplete="current-password"
          />
        </div>

        <p v-if="errorText" class="login-form__error">{{ errorText }}</p>

        <el-button
          type="primary"
          size="large"
          class="login-form__submit"
          native-type="submit"
          :loading="loading"
        >
          登录
        </el-button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background:
    radial-gradient(circle, rgba(145, 145, 145, 0.55) 0 1.1px, transparent 1.2px);
  background-size: 42px 42px;
  background-color: #ffffff;
}

.login-card {
  width: min(100%, 420px);
  padding: 32px 28px;
  border: 1px solid rgba(17, 17, 17, 0.08);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 16px 40px rgba(17, 17, 17, 0.06);
}

.login-card__header {
  margin-bottom: 24px;
}

.login-card__eyebrow {
  margin: 0 0 10px;
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #8a8a8a;
}

.login-card__header h1 {
  margin: 0;
  font-size: 30px;
  color: #171512;
}

.login-card__desc {
  margin: 10px 0 0;
  color: #6f6f6f;
  line-height: 1.7;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.login-form__field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.login-form__field label {
  font-size: 14px;
  font-weight: 600;
  color: #171512;
}

.login-form__error {
  margin: 0;
  font-size: 14px;
  color: #d03050;
}

.login-form__submit {
  width: 100%;
}

.login-page :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px rgba(17, 17, 17, 0.08) inset;
}

.login-page :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px rgba(17, 17, 17, 0.18) inset;
}

.login-page :deep(.el-button--primary) {
  border-color: #111111;
  background: #111111;
}

.login-page :deep(.el-button--primary:hover),
.login-page :deep(.el-button--primary:focus-visible) {
  border-color: #2a2a2a;
  background: #2a2a2a;
}
</style>
