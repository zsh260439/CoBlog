<script setup lang="ts">
import { computed } from 'vue'
import { useWindowScroll } from '@vueuse/core'

const { y: scrollY } = useWindowScroll()

// 用当前滚动距离除以页面可滚动总高度，得到顶部阅读进度条百分比。
const progress = computed(() => {
  const scrollTop = scrollY.value
  const docHeight = document.documentElement.scrollHeight - window.innerHeight
  return docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
})
</script>

<template>
  <div class="progress-bar">
    <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
  </div>
</template>

<style scoped>
.progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: transparent;
  z-index: 10000;
}

.progress-fill {
  height: 100%;
  background: #0077cc;
  transition: width 0.1s ease-out;
}
</style>
