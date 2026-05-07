<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import ScrollProgress from '@/components/ScrollProgress.vue'
import BackToTopButton from '@/components/ui/BackToTopButton.vue'
import AppHeader from '@/components/ui/AppHeader.vue'
import AppFooter from '@/components/ui/AppFooter.vue'
import TechCursor from '@/components/ui/TechCursor.vue'
import { trackVisit } from '@/servers/visit'

const route = useRoute()
const router = useRouter()

const isOverlayLayout = computed(() => route.meta.headerStyle === 'overlay')
const isAdminShell = computed(() => route.meta.appShell === 'admin')
const showTechCursor = computed(() => !isAdminShell.value && route.name !== 'home' && route.name !== 'login')

const trackPageVisit = async (path: string, appShell: unknown, routeName: unknown) => {
  if (appShell === 'admin' || routeName === 'login') {
    return
  }

  try {
    await trackVisit(path)
  } catch {
    // 统计失败不影响页面正常浏览
  }
}

let removeAfterEach: (() => void) | undefined

onMounted(async () => {
  await router.isReady()
  await trackPageVisit(route.fullPath, route.meta.appShell, route.name)
  removeAfterEach = router.afterEach(async (to) => {
    await trackPageVisit(to.fullPath, to.meta.appShell, to.name)
  })
})

onBeforeUnmount(() => {
  removeAfterEach?.()
})
</script>

<template>
  <div class="app">
    <ScrollProgress v-if="!isAdminShell" />
    <AppHeader v-if="!isAdminShell" />
    <TechCursor v-if="showTechCursor" />
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
