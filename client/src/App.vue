<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import ScrollProgress from '@/components/ScrollProgress.vue'
import BackToTopButton from '@/components/ui/BackToTopButton.vue'
import AppHeader from '@/components/ui/AppHeader.vue'
import AppFooter from '@/components/ui/AppFooter.vue'

const route = useRoute()

const isOverlayLayout = computed(() => route.meta.headerStyle === 'overlay')
const routeViewKey = computed(() => JSON.stringify({ path: route.path, query: route.query }))
</script>

<template>
  <div class="app">
    <!-- 顶部滚动进度条 -->
    <ScrollProgress />

    <AppHeader />
    <main class="main" :class="{ 'main--overlay': isOverlayLayout }">
      <RouterView v-slot="{ Component }">
        <component :is="Component" :key="routeViewKey" class="route-page" />
      </RouterView>
    </main>
    <AppFooter />
    <BackToTopButton />
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
  margin-top: var(--header-height);
  overflow-x: clip;
}

.main--overlay {
  margin-top: 0;
}

.route-page {
  min-height: 100%;
}
</style>
