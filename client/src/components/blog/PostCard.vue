<script setup lang="ts">
import { computed } from 'vue'
import type { ArticleCardProps } from '@/types/article'
import { estimateReadTime, formatDate } from '@/utils'

const props = withDefaults(defineProps<ArticleCardProps>(), {
  featured: false
})

const coverStyle = computed(() => {
  if (!props.article.coverImage) {
    return undefined
  }

  return {
    backgroundImage: `linear-gradient(180deg, rgba(12, 19, 30, 0.12), rgba(12, 19, 30, 0.7)), url(${props.article.coverImage})`
  }
})

const excerpt = computed(() => props.article.excerpt || props.article.content.slice(0, 140))
const publishedAt = computed(() => formatDate(props.article.createdAt, 'long'))
const readTime = computed(() => estimateReadTime(props.article.content))
</script>

<template>
  <router-link
    :to="{ name: 'article', params: { slug: article.slug } }"
    class="post-card"
    :class="{ 'post-card--featured': featured }"
  >
    <div class="post-card__media" :class="{ 'post-card__media--placeholder': !article.coverImage }" :style="coverStyle">
      <span class="post-card__category">{{ article.category }}</span>
      <div class="post-card__shine"></div>
    </div>

    <div class="post-card__body">
      <div class="post-card__meta">
        <span>{{ publishedAt }}</span>
        <span class="post-card__dot"></span>
        <span>{{ readTime }}</span>
      </div>

      <h2 class="post-card__title">{{ article.title }}</h2>
      <p class="post-card__excerpt">{{ excerpt }}</p>

      <div class="post-card__footer">
        <span class="post-card__action">阅读全文</span>
      </div>
    </div>
  </router-link>
</template>

<style scoped>
.post-card {
  display: grid;
  grid-template-columns: minmax(0, 260px) minmax(0, 1fr);
  overflow: hidden;
  border: 1px solid var(--border-light);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: var(--shadow-soft);
  text-decoration: none;
  transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

.post-card:hover {
  transform: translateY(-4px);
  border-color: rgba(0, 119, 204, 0.18);
  box-shadow: var(--shadow-strong);
}

.post-card--featured {
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
}

.post-card__media {
  position: relative;
  min-height: 220px;
  background:
    linear-gradient(140deg, rgba(12, 26, 44, 0.92), rgba(47, 64, 102, 0.82) 44%, rgba(208, 137, 91, 0.72));
  background-size: cover;
  background-position: center;
}

.post-card__media--placeholder::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 22% 26%, rgba(255, 214, 151, 0.42), transparent 24%),
    radial-gradient(circle at 72% 18%, rgba(106, 183, 236, 0.35), transparent 32%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.06), transparent 60%);
}

.post-card__category {
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 1;
  padding: 0.45rem 0.75rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(10px);
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.92);
}

.post-card__shine {
  position: absolute;
  inset: auto 1rem 1rem auto;
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.26), transparent 72%);
  filter: blur(8px);
}

.post-card__body {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1.25rem;
  padding: 1.75rem;
}

.post-card__meta,
.post-card__footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}

.post-card__meta {
  font-family: var(--font-mono);
  font-size: 0.74rem;
  color: var(--text-muted);
}

.post-card__dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--accent-cyan);
}

.post-card__title {
  margin: 0;
  font-size: clamp(1.45rem, 2.8vw, 2rem);
  line-height: 1.2;
  color: var(--text-primary);
  letter-spacing: -0.03em;
}

.post-card__excerpt {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.85;
}

.post-card__action {
  margin-left: auto;
  font-family: var(--font-mono);
  font-size: 0.74rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--accent-cyan);
}

@media (max-width: 900px) {
  .post-card,
  .post-card--featured {
    grid-template-columns: 1fr;
  }

  .post-card__media {
    min-height: 240px;
  }

  .post-card__action {
    margin-left: 0;
  }
}

@media (max-width: 767px) {
  .post-card {
    border-radius: 20px;
  }

  .post-card__body {
    padding: 1.25rem;
  }
}
</style>
