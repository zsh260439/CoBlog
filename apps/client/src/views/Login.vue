<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Lock, User } from '@element-plus/icons-vue'
import { login } from '@/servers/auth'
import { siteConfig } from '@/config/site'

const router = useRouter()

const form = reactive({
  username: '',
  password: '',
})

const loading = ref(false)
const errorText = ref('')

const orbitIcons = [
  'https://cdn.simpleicons.org/vuedotjs/42B883',
  'https://cdn.simpleicons.org/typescript/3178C6',
  'https://cdn.simpleicons.org/nodedotjs/5FA04E',
  'https://cdn.simpleicons.org/nestjs/E0234E',
  'https://cdn.simpleicons.org/vite/646CFF',
  'https://cdn.simpleicons.org/element/409EFF',
]

const outerOrbitIcons = orbitIcons.slice(0, 3).map((src, index) => ({
  src,
  angle: index * 120,
  radius: 160,
}))

const innerOrbitIcons = orbitIcons.slice(3).map((src, index) => ({
  src,
  angle: 60 + index * 120,
  radius: 102,
}))

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
      password: form.password,
    })

    const token = result.data.accessToken
    localStorage.setItem('local-token', token)
    ElMessage.success('登录成功')
    router.push('/admin')
  } catch (error: any) {
    errorText.value = error?.response?.data?.message || error?.message || '登录失败，请检查账号密码'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-shell">
      <div class="login-card">
        <section class="login-card__scene">
          <div class="login-scene__ripple"></div>
          <div class="login-scene__ripple login-scene__ripple--delay"></div>

          <div class="login-scene__headline">
            <span class="login-scene__eyebrow">Admin Access</span>
            <h1>{{ siteConfig.ownerName }}</h1>
            <p>内容管理、留言处理与站点维护，都从这里开始。</p>
          </div>

          <div class="login-orbit login-orbit--outer">
            <span
              v-for="icon in outerOrbitIcons"
              :key="`outer-${icon.src}`"
              class="login-orbit__item"
              :style="{ transform: `translate(-50%, -50%) rotate(${icon.angle}deg) translateX(${icon.radius}px) rotate(-${icon.angle}deg)` }"
            >
              <img :src="icon.src" alt="tech icon" />
            </span>
          </div>

          <div class="login-orbit login-orbit--inner">
            <span
              v-for="icon in innerOrbitIcons"
              :key="`inner-${icon.src}`"
              class="login-orbit__item"
              :style="{ transform: `translate(-50%, -50%) rotate(${icon.angle}deg) translateX(${icon.radius}px) rotate(-${icon.angle}deg)` }"
            >
              <img :src="icon.src" alt="tech icon" />
            </span>
          </div>

          <div class="login-scene__center-word">{{ siteConfig.ownerName }}</div>
        </section>

        <section class="login-card__form-side">
          <div class="login-form-card">
            <div class="login-card__header">
              <p class="login-card__eyebrow">Welcome back</p>
              <h2>后台登录</h2>
              <p class="login-card__desc">只保留账号和密码，专注于快速进入后台。</p>
            </div>

            <form class="login-form" @submit.prevent="handleSubmit">
              <div class="login-form__field">
                <label>账号</label>
                <el-input v-model="form.username" size="large" placeholder="请输入账号" autocomplete="username">
                  <template #prefix>
                    <el-icon><User /></el-icon>
                  </template>
                </el-input>
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
                >
                  <template #prefix>
                    <el-icon><Lock /></el-icon>
                  </template>
                </el-input>
              </div>

              <p v-if="errorText" class="login-form__error">{{ errorText }}</p>

              <el-button type="primary" size="large" class="login-form__submit" native-type="submit" :loading="loading">
                登录
              </el-button>
            </form>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  display: grid;
  place-items: center;
  padding: 1.5rem;
}

.login-shell {
  width: min(100%, 1180px);
}

.login-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 430px;
  min-height: 720px;
  overflow: hidden;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 28px 68px rgba(15, 23, 42, 0.08);
}

.login-card__scene {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(circle at 30% 30%, rgba(191, 219, 254, 0.42), transparent 24%),
    radial-gradient(circle at 68% 26%, rgba(216, 180, 254, 0.18), transparent 20%),
    linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%);
}

.login-card__form-side {
  display: grid;
  place-items: center;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.92);
}

.login-scene__headline {
  position: relative;
  z-index: 2;
  max-width: 420px;
  text-align: center;
}

.login-scene__eyebrow,
.login-card__eyebrow {
  display: inline-flex;
  align-items: center;
  min-height: 2rem;
  padding: 0 0.8rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.78);
  color: #6b7280;
  font-size: 0.74rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.login-scene__headline h1 {
  margin: 1.2rem 0 0;
  font-size: clamp(3rem, 7vw, 5.6rem);
  line-height: 0.96;
  color: #111827;
}

.login-scene__headline p {
  margin: 1rem auto 0;
  max-width: 360px;
  color: #4b5563;
  line-height: 1.9;
}

.login-scene__ripple {
  position: absolute;
  width: 280px;
  height: 280px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.26);
  animation: ripple 2.6s ease-in-out infinite;
}

.login-scene__ripple--delay {
  width: 420px;
  height: 420px;
  animation-delay: 0.7s;
}

.login-orbit {
  position: absolute;
  inset: 50% auto auto 50%;
  transform: translate(-50%, -50%);
  border-radius: 999px;
}

.login-orbit--outer {
  width: 360px;
  height: 360px;
  animation: spin 20s linear infinite;
}

.login-orbit--inner {
  width: 240px;
  height: 240px;
  animation: spin-reverse 16s linear infinite;
}

.login-orbit__item {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
}

.login-orbit__item img {
  width: 26px;
  height: 26px;
}

.login-scene__center-word {
  position: absolute;
  inset: 50% auto auto 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  font-size: clamp(3.2rem, 8vw, 5.6rem);
  font-weight: 700;
  line-height: 0.92;
  letter-spacing: -0.05em;
  color: rgba(17, 24, 39, 0.14);
}

.login-form-card {
  width: min(100%, 390px);
  padding: 1rem 0;
}

.login-card__header h2 {
  margin: 1rem 0 0;
  font-size: 2rem;
  color: #111827;
}

.login-card__desc {
  margin: 0.8rem 0 0;
  color: #6b7280;
  line-height: 1.8;
}

.login-form {
  margin-top: 1.8rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.login-form__field {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.login-form__field label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1f2937;
}

.login-form__error {
  margin: 0;
  font-size: 0.9rem;
  color: #dc2626;
}

.login-form__submit {
  width: 100%;
}

.login-page :deep(.el-input__wrapper) {
  border-radius: 14px;
  background: #f8fafc;
  box-shadow: 0 0 0 1px rgba(148, 163, 184, 0.18) inset;
}

.login-page :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.34) inset;
}

.login-page :deep(.el-button--primary) {
  border-color: #111827;
  background: #111827;
}

.login-page :deep(.el-button--primary:hover),
.login-page :deep(.el-button--primary:focus-visible) {
  border-color: #1f2937;
  background: #1f2937;
}

@keyframes ripple {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    transform: translate(-50%, -50%) scale(0.94);
  }
}

@keyframes spin {
  from {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

@keyframes spin-reverse {
  from {
    transform: translate(-50%, -50%) rotate(360deg);
  }
  to {
    transform: translate(-50%, -50%) rotate(0deg);
  }
}

@media (max-width: 1024px) {
  .login-card {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .login-card__scene {
    min-height: 38vh;
  }
}

@media (max-width: 767px) {
  .login-page {
    padding: 0.8rem;
  }

  .login-scene__headline h1 {
    font-size: 2.6rem;
  }

  .login-orbit--outer {
    width: 280px;
    height: 280px;
  }

  .login-orbit--inner {
    width: 180px;
    height: 180px;
  }

  .login-card__form-side {
    padding: 1.25rem;
  }
}
</style>
