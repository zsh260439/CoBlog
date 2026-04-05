<script setup lang="ts">
import { computed } from 'vue'
import type { ArticleHeroProps } from '@/types'

const props = defineProps<ArticleHeroProps>()

const heroStyle = computed(() => {
  if (!props.post.coverImage) {
    return undefined
  }

  return {
    backgroundImage: `linear-gradient(180deg, rgba(13, 18, 28, 0.18), rgba(13, 18, 28, 0.56)), url(${props.post.coverImage})`
  }
})
</script>

<template>
  <section class="article-hero">
    <div class="article-hero__media" :style="heroStyle"></div>
    <div class="article-hero__veil"></div>
    <div class="article-hero__mist"></div>

    <div class="article-hero__inner">
      <h1 class="article-hero__title">{{ post.title }}</h1>

      <div class="article-hero__meta">
        <span v-for="item in stats" :key="item">{{ item }}</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.article-hero {
  position: relative;
  min-height: 420px;
  overflow: hidden;
  color: #ffffff;
}

.article-hero__media,
.article-hero__veil,
.article-hero__mist {
  position: absolute;
  inset: 0;
}

.article-hero__media {
  background:
    linear-gradient(135deg, rgba(45, 56, 76, 0.84), rgba(80, 88, 101, 0.32)),
    linear-gradient(180deg, rgba(255, 255, 255, 0.05), transparent 36%);
  background-size: cover;
  background-position: center;
  transform: scale(1.03);
}

.article-hero__veil {
  background: linear-gradient(180deg, rgba(11, 18, 28, 0.16), rgba(11, 18, 28, 0.42));
}

.article-hero__mist {
  top: auto;
  height: 150px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.75) 60%, #ffffff 100%);
}

.article-hero__inner {
  position: relative;
  z-index: 1;
  width: min(100%, var(--content-width));
  margin: 0 auto;
  padding: calc(var(--header-height) + 3rem) 2rem 7rem;
  text-align: center;
}

.article-hero__title {
  margin: 0;
  font-size: clamp(1.7rem, 4.2vw, 2.6rem);
  line-height: 1.15;
  letter-spacing: -0.04em;
  font-weight: 500;
}

.article-hero__meta {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.85rem 1rem;
  margin-top: 1rem;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.9);
}

@media (max-width: 767px) {
  .article-hero {
    min-height: 360px;
  }

  .article-hero__inner {
    padding: calc(var(--header-height) + 2.2rem) 1.25rem 6rem;
  }
}
</style>
