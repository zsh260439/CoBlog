<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  eyebrow?: string
  title: string
  description?: string
  image?: string
  align?: 'left' | 'center'
  height?: 'medium' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  eyebrow: '',
  description: '',
  image: '',
  align: 'center',
  height: 'large'
})

const heroStyle = computed(() => {
  if (!props.image) {
    return undefined
  }

  return {
    backgroundImage: `linear-gradient(180deg, rgba(7, 13, 22, 0.18), rgba(7, 13, 22, 0.74)), url(${props.image})`
  }
})
</script>

<template>
  <section
    class="page-hero"
    :class="[`page-hero--${align}`, `page-hero--${height}`, { 'page-hero--placeholder': !image }]"
  >
    <div class="page-hero__media" :style="heroStyle">
      <div class="page-hero__pattern"></div>
      <div class="page-hero__glow page-hero__glow--cyan"></div>
      <div class="page-hero__glow page-hero__glow--warm"></div>
    </div>

    <div class="page-hero__inner">
      <span v-if="eyebrow" class="page-hero__eyebrow">{{ eyebrow }}</span>
      <h1 class="page-hero__title">{{ title }}</h1>
      <p v-if="description" class="page-hero__description">{{ description }}</p>

      <div v-if="$slots.meta" class="page-hero__meta">
        <slot name="meta" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.page-hero {
  position: relative;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
  color: #ffffff;
}

.page-hero--large {
  min-height: min(76vh, 680px);
}

.page-hero--medium {
  min-height: min(60vh, 520px);
}

.page-hero__media {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(140deg, rgba(12, 26, 44, 0.94), rgba(43, 57, 93, 0.75) 42%, rgba(203, 119, 84, 0.52) 100%);
  background-position: center;
  background-size: cover;
  transform: scale(1.03);
}

.page-hero__pattern {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.06) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.35), transparent 85%);
}

.page-hero__glow {
  position: absolute;
  border-radius: 999px;
  filter: blur(18px);
  opacity: 0.72;
}

.page-hero__glow--cyan {
  inset: auto auto 8% -8%;
  width: 280px;
  height: 280px;
  background: radial-gradient(circle, rgba(87, 169, 227, 0.38), transparent 72%);
}

.page-hero__glow--warm {
  inset: 6% -4% auto auto;
  width: 360px;
  height: 220px;
  background: radial-gradient(circle, rgba(239, 171, 120, 0.42), transparent 74%);
}

.page-hero__inner {
  position: relative;
  z-index: 1;
  width: min(100%, var(--content-width));
  margin: 0 auto;
  padding: calc(var(--header-height) + 4.5rem) 2rem 5rem;
}

.page-hero--left .page-hero__inner {
  text-align: left;
}

.page-hero--center .page-hero__inner {
  text-align: center;
}

.page-hero__eyebrow {
  display: inline-block;
  margin-bottom: 1rem;
  font-family: var(--font-primary);
  font-size: 0.7rem;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.76);
}

.page-hero__title {
  margin: 0;
  font-family: var(--font-primary);
  font-size: clamp(1.9rem, 4.8vw, 3rem);
  font-weight: 400;
  line-height: 1.08;
  letter-spacing: -0.04em;
  text-wrap: balance;
}

.page-hero__description {
  width: min(100%, 46rem);
  margin: 1.5rem auto 0;
  font-size: 0.94rem;
  line-height: 1.9;
  color: rgba(255, 255, 255, 0.82);
}

.page-hero--left .page-hero__description {
  margin-left: 0;
}

.page-hero__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.9rem 1.25rem;
  align-items: center;
  justify-content: center;
  margin-top: 1.75rem;
  font-family: var(--font-primary);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.82);
}

.page-hero--left .page-hero__meta {
  justify-content: flex-start;
}

@media (max-width: 767px) {
  .page-hero__inner {
    padding: calc(var(--header-height) + 3.75rem) 1.25rem 3.5rem;
  }

  .page-hero__description {
    font-size: 0.95rem;
  }
}
</style>
