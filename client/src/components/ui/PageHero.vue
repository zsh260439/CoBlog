<script setup lang="ts">
import { computed } from 'vue'
import type { PageHeroProps } from '@/types/ui'

const props = withDefaults(defineProps<PageHeroProps>(), {
  eyebrow: '',
  description: '',
  image: '',
  align: 'center',
  height: 'large',
  mistHeight: 148
})

const heroStyle = computed(() => {
  if (!props.image) {
    return undefined
  }

  return {
    backgroundImage: `linear-gradient(180deg, rgba(16, 20, 31, 0.16), rgba(16, 20, 31, 0.58)), url(${props.image})`
  }
})

const mistStyle = computed(() => ({
  height: `${props.mistHeight}px`
}))

const innerClass = computed(() => ({
  'page-hero__inner--medium': props.height === 'medium',
  'page-hero__inner--large': props.height === 'large'
}))

const metaClass = computed(() => ({
  'page-hero__meta--left': props.align === 'left'
}))

const mediaClass = computed(() => ({
  'page-hero__media--placeholder': !props.image
}))

const heroClass = computed(() => ({
  'page-hero--medium': props.height === 'medium',
  'page-hero--large': props.height === 'large',
  'page-hero--left': props.align === 'left',
  'page-hero--center': props.align === 'center'
}))

const descriptionClass = computed(() => ({
  'page-hero__description--left': props.align === 'left'
}))
</script>

<template>
  <section class="page-hero" :class="heroClass">
    <div class="page-hero__media" :class="mediaClass" :style="heroStyle"></div>
    <div class="page-hero__veil"></div>
    <div class="page-hero__mist" :style="mistStyle"></div>

    <div class="page-hero__inner" :class="innerClass">
      <span v-if="eyebrow" class="page-hero__eyebrow">{{ eyebrow }}</span>
      <h1 class="page-hero__title">{{ title }}</h1>
      <p v-if="description" class="page-hero__description" :class="descriptionClass">{{ description }}</p>

      <div v-if="$slots.meta" class="page-hero__meta" :class="metaClass">
        <slot name="meta" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.page-hero {
  position: relative;
  overflow: hidden;
  color: #ffffff;
}

.page-hero--large {
  min-height: 370px;
}

.page-hero--medium {
  min-height: 360px;
}

.page-hero__media {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(135deg, rgba(57, 64, 100, 0.88), rgba(27, 43, 89, 0.48)),
    linear-gradient(180deg, rgba(255, 255, 255, 0.06), transparent 32%);
  background-position: center;
  background-size: cover;
  transform: scale(1.02);
}

.page-hero__media--placeholder {
  background:
    linear-gradient(135deg, rgba(57, 64, 100, 0.88), rgba(27, 43, 89, 0.48)),
    linear-gradient(180deg, rgba(255, 255, 255, 0.06), transparent 32%);
}

.page-hero__veil {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(11, 18, 28, 0.16), rgba(11, 18, 28, 0.38));
}

.page-hero__mist {
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.74) 60%, #ffffff 100%);
}

.page-hero__inner {
  position: relative;
  z-index: 1;
  width: min(100%, var(--content-width));
  margin: 0 auto;
  text-align: center;
}

.page-hero__inner--large {
  padding: calc(var(--header-height) + 3rem) 2rem 6.8rem;
}

.page-hero__inner--medium {
  padding: calc(var(--header-height) + 2.8rem) 2rem 6.6rem;
}

.page-hero--left .page-hero__inner {
  text-align: left;
}

.page-hero__eyebrow {
  display: inline-block;
  margin-bottom: 0.9rem;
  font-family: var(--font-primary);
  font-size: 0.7rem;
  letter-spacing: 0.22em;
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
  width: min(100%, 42rem);
  margin: 0.95rem auto 0;
  font-size: 0.94rem;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.9);
}

.page-hero__description--left {
  margin-left: 0;
}

.page-hero__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.9rem;
  justify-content: center;
  margin-top: 1rem;
  font-family: var(--font-primary);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.86);
}

.page-hero__meta--left {
  justify-content: flex-start;
}

@media (max-width: 767px) {
  .page-hero--large,
  .page-hero--medium {
    min-height: 320px;
  }

  .page-hero__inner--large,
  .page-hero__inner--medium {
    padding: calc(var(--header-height) + 2.4rem) 1.25rem 5.8rem;
  }

  .page-hero__description {
    font-size: 0.95rem;
  }
}
</style>
