<script setup lang="ts">
const props = withDefaults(defineProps<{
  text: string
  repeat?: number
  duration?: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  strokeColor?: string
  className?: string
}>(), {
  repeat: 4,
  duration: 20,
  size: 'lg',
  strokeColor: 'rgba(107, 114, 128, 0.5)',
  className: '',
})

const sizeClassMap = {
  sm: 'text-[56px] md:text-[72px]',
  md: 'text-[72px] md:text-[92px]',
  lg: 'text-[86px] md:text-[118px]',
  xl: 'text-[100px] md:text-[144px]',
}
</script>

<template>
  <div :class="['marquee-text', className]" :style="{ '--marquee-duration': `${duration}s` }">
    <div class="marquee-text__fade marquee-text__fade--left"></div>
    <div class="marquee-text__fade marquee-text__fade--right"></div>

    <div class="marquee-text__track">
      <div v-for="index in repeat" :key="index" class="marquee-text__item">
        <span
          :class="['marquee-text__label', sizeClassMap[size]]"
          :style="{ WebkitTextStroke: `1px ${strokeColor}` }"
        >
          {{ text }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.marquee-text {
  position: relative;
  width: 100%;
  overflow: hidden;
  padding: 1rem 0;
}

.marquee-text__track {
  display: flex;
  width: max-content;
  white-space: nowrap;
  animation: marquee var(--marquee-duration) linear infinite;
}

.marquee-text__item {
  display: flex;
  align-items: center;
  padding-inline: 1rem;
}

.marquee-text__label {
  font-weight: 700;
  color: transparent;
  line-height: 0.9;
}

.marquee-text__fade {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 14%;
  z-index: 1;
  pointer-events: none;
}

.marquee-text__fade--left {
  left: 0;
  background: linear-gradient(90deg, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0));
}

.marquee-text__fade--right {
  right: 0;
  background: linear-gradient(270deg, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0));
}

@keyframes marquee {
  from {
    transform: translateX(0%);
  }
  to {
    transform: translateX(-50%);
  }
}
</style>
