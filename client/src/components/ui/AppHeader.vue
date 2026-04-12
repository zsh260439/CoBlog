<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useWindowScroll } from '@vueuse/core'
import { primaryNav, siteConfig } from '@/config/site'

const isMenuOpen = ref(false)
const route = useRoute()
const { y } = useWindowScroll()

const navItems = primaryNav

// 把站点名称拆成三段，方便品牌字母做不同样式强调。
const brandLeading = computed(() => siteConfig.name.slice(0, 1))
const brandAccent = computed(() => siteConfig.name.slice(1, 2))
const brandTrailing = computed(() => siteConfig.name.slice(2))

// 首页头图区域滚动较浅时使用 overlay 样式，菜单打开后恢复普通头部。
const isOverlayHeader = computed(
  () => route.meta.headerStyle === 'overlay' && y.value < 36 && !isMenuOpen.value
)

// 既支持路径精确匹配，也支持按路由名高亮一组关联页面。
const isNavItemActive = (path: string, routeNames: string[]) => {
  if (route.path === path) {
    return true
  }

  return routeNames.includes(String(route.name ?? ''))
}

// 移动端菜单只切换一个布尔状态，模板里据此控制过渡和图标动画。
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

// 切路由后自动收起移动端菜单，避免旧状态残留到新页面。
watch(
  () => route.fullPath,
  () => {
    isMenuOpen.value = false
  }
)
</script>

<template>
  <header class="header" :class="{ 'header--overlay': isOverlayHeader }">
    <div class="header-inner">
      <router-link to="/" class="logo">
        <span class="logo-bracket">&lt;</span>
        <span>{{ brandLeading }}</span><span class="accent">{{ brandAccent }}</span><span>{{ brandTrailing }}</span>
        <span class="logo-bracket">/&gt;</span>
      </router-link>

      <nav class="nav-desktop">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-link"
          :class="{ active: isNavItemActive(item.path, item.routeNames) }"
        >
          {{ item.label }}
        </router-link>
      </nav>

      <button class="menu-btn" @click="toggleMenu" aria-label="菜单">
        <span :class="{ open: isMenuOpen }">
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>
    </div>

    <Transition name="slide">
      <nav v-if="isMenuOpen" class="nav-mobile">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-mobile-link"
          :class="{ active: isNavItemActive(item.path, item.routeNames) }"
          @click="isMenuOpen = false"
        >
          {{ item.label }}
        </router-link>

      </nav>
    </Transition>
  </header>
</template>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border-light);
  transition: background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

.header--overlay {
  background: linear-gradient(180deg, rgba(12, 18, 28, 0.64), rgba(12, 18, 28, 0.12));
  border-bottom-color: rgba(255, 255, 255, 0.08);
  box-shadow: none;
}

.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  min-height: var(--header-height);
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  font-family: var(--font-primary);
  font-size: 1rem;
  font-weight: 400;
  color: var(--text-primary);
  text-decoration: none;
  letter-spacing: -0.01em;
  transition: color 0.3s ease;
}

.header--overlay .logo {
  color: rgba(255, 255, 255, 0.96);
}

.logo-bracket {
  font-family: var(--font-primary);
  font-size: 0.82rem;
  color: var(--text-muted);
  opacity: 0.5;
}

.header--overlay .logo-bracket {
  color: rgba(255, 255, 255, 0.7);
}

.accent {
  color: var(--accent-cyan);
}

.nav-desktop {
  display: none;
  gap: 2.5rem;
}

@media (min-width: 768px) {
  .nav-desktop {
    display: flex;
  }
}

.nav-link {
  font-family: var(--font-primary);
  font-size: 0.72rem;
  color: var(--text-secondary);
  text-decoration: none;
  position: relative;
  padding: 0.25rem 0;
  transition: color 0.3s ease;
}

.header--overlay .nav-link {
  color: rgba(255, 255, 255, 0.74);
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 1px;
  background: var(--accent-cyan);
  transition: width 0.3s ease;
}

.nav-link:hover,
.nav-link.active {
  color: var(--text-primary);
}

.header--overlay .nav-link:hover,
.header--overlay .nav-link.active {
  color: #ffffff;
}

.nav-link:hover::after,
.nav-link.active::after {
  width: 100%;
}

.menu-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
}

.header--overlay .menu-btn {
  color: #ffffff;
}

.menu-btn span {
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 20px;
}

.menu-btn span span {
  display: block;
  height: 1px;
  background: var(--text-secondary);
  transition: all 0.3s ease;
}

.header--overlay .menu-btn span span {
  background: rgba(255, 255, 255, 0.92);
}

.menu-btn span.open span:nth-child(1) {
  transform: rotate(45deg) translate(4px, 4px);
}

.menu-btn span.open span:nth-child(2) {
  opacity: 0;
}

.menu-btn span.open span:nth-child(3) {
  transform: rotate(-45deg) translate(4px, -4px);
}

@media (min-width: 768px) {
  .menu-btn {
    display: none;
  }
}

.nav-mobile {
  display: flex;
  flex-direction: column;
  padding: 1rem 2rem;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-light);
}

.nav-mobile-link {
  font-family: var(--font-primary);
  font-size: 0.76rem;
  color: var(--text-secondary);
  text-decoration: none;
  padding: 0.875rem 0;
  border-bottom: 1px solid var(--border-light);
  transition: color 0.3s ease;
}

.nav-mobile-link:last-child {
  border-bottom: none;
}

.nav-mobile-link:hover {
  color: var(--text-primary);
}

.nav-mobile-link.active {
  color: var(--accent-cyan);
}


.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 767px) {
  .header-inner {
    padding: 0.875rem 1.25rem;
  }
}
</style>
