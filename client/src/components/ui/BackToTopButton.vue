<script setup lang="ts">
import { computed } from 'vue'
import { useWindowScroll } from '@vueuse/core'

const { y } = useWindowScroll()

const isVisible = computed(() => y.value > 360)

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}
</script>

<template>
  <Transition name="back-top-fade">
    <button
      v-if="isVisible"
      type="button"
      class="back-top"
      aria-label="返回顶部"
      @click="scrollToTop"
    >
      <svg viewBox="0 0 24 24" class="back-top__icon" aria-hidden="true">
        <path d="M12 6.5L5.5 13h3.9v4.5h5.2V13h3.9L12 6.5Z" fill="currentColor" />
      </svg>
    </button>
  </Transition>
</template>

<style scoped>
.back-top {
  position: fixed;
  right: 1.35rem;
  bottom: 1.5rem;
  z-index: 120;
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border: 1px solid rgba(15, 23, 42, 0.1);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
  color: #637086;
  cursor: pointer;
  backdrop-filter: blur(10px);
  transition: transform 0.22s ease, color 0.22s ease, border-color 0.22s ease;
}

.back-top:hover {
  transform: translateY(-2px);
  color: var(--text-primary);
  border-color: rgba(15, 23, 42, 0.16);
}

.back-top__icon {
  width: 18px;
  height: 18px;
}

.back-top-fade-enter-active,
.back-top-fade-leave-active {
  transition: opacity 0.32s ease, transform 0.32s ease;
}

.back-top-fade-enter-from,
.back-top-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@media (max-width: 767px) {
  .back-top {
    right: 1rem;
    bottom: 1rem;
    width: 38px;
    height: 38px;
  }
}
</style>
