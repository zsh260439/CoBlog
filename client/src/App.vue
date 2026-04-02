<script setup lang="ts">
import ScrollProgress from '@/components/ScrollProgress.vue'
import AppHeader from '@/components/ui/AppHeader.vue'
import AppFooter from '@/components/ui/AppFooter.vue'
</script>

<template>
  <div class="app">
    <!-- 顶部滚动进度条 -->
    <ScrollProgress />

    <AppHeader />
    <main class="main">
      <router-view />
    </main>
    <AppFooter />
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main {
  flex: 1;
  margin-top: 60px;
}
</style>
