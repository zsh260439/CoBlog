<script setup lang="ts">
import { ref } from 'vue'

const isMenuOpen = ref(false)

const navItems = [
  { label: '文章', path: '/' },
  { label: '关于', path: '/about' },
  { label: '文档', path: '/docs' }
]

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}
</script>

<template>
  <header class="header">
    <div class="header-inner">
      <!-- Logo -->
      <router-link to="/" class="logo">
        <span class="logo-bracket">&lt;</span>
        <span>C</span><span class="accent">o</span><span>Blog</span>
        <span class="logo-bracket">/&gt;</span>
      </router-link>

      <!-- 导航 -->
      <nav class="nav-desktop">
      </nav>

      <!-- 移动端菜单按钮 -->
      <button class="menu-btn" @click="toggleMenu" aria-label="菜单">
        <span :class="{ open: isMenuOpen }">
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>
    </div>

    <!-- 移动端菜单 -->
    <Transition name="slide">
      <nav v-if="isMenuOpen" class="nav-mobile">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-mobile-link"
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
}

.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.25rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.125rem;
  font-weight: 400;
  color: var(--text-primary);
  text-decoration: none;
  letter-spacing: -0.01em;
}

.logo-bracket {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.9rem;
  color: var(--text-muted);
  opacity: 0.5;
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
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-decoration: none;
  position: relative;
  padding: 0.25rem 0;
  transition: color 0.3s ease;
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
.nav-link.router-link-active {
  color: var(--text-primary);
}

.nav-link:hover::after,
.nav-link.router-link-active::after {
  width: 100%;
}

.menu-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
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
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
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

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
