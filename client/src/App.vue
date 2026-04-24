<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import ScrollProgress from '@/components/ScrollProgress.vue'
import BackToTopButton from '@/components/ui/BackToTopButton.vue'
import AppHeader from '@/components/ui/AppHeader.vue'
import AppFooter from '@/components/ui/AppFooter.vue'

const route = useRoute()

const isOverlayLayout = computed(() => route.meta.headerStyle === 'overlay')
const isAdminShell = computed(() => route.meta.appShell === 'admin')
</script>

<template>
  <div class="app">
    <ScrollProgress v-if="!isAdminShell" />
    <AppHeader v-if="!isAdminShell" />
    <main class="main" :class="{ 'main--overlay': isOverlayLayout, 'main--plain': isAdminShell }">
      <RouterView v-slot="{ Component }">
          <component :is="Component" class="route-page" />
      </RouterView>
    </main>
    <AppFooter v-if="!isAdminShell" />
    <BackToTopButton v-if="!isAdminShell" />
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

.main--plain {
  margin-top: 0;
}

.route-page {
  min-height: 100%;
}
</style>
