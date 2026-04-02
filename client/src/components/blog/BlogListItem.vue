<script setup lang="ts">
import type { Article } from '@/types'
import { estimateReadTime, formatDate } from '@/utils'

defineProps<{
  post: Article
}>()
</script>

<template>
  <router-link :to="{ name: 'article', params: { slug: post.slug } }" class="blog-post">
    <div class="blog-post__cover" :style="{ backgroundImage: `url(${post.coverImage})` }"></div>

    <div class="blog-post__body">
      <div class="blog-post__meta">
        <span>{{ post.category }}</span>
        <span>{{ formatDate(post.createdAt, 'iso').slice(0, 16).replace('T', ' ') }}</span>
      </div>

      <h2 class="blog-post__title">{{ post.title }}</h2>
      <p class="blog-post__excerpt">{{ post.excerpt }}</p>

      <div class="blog-post__stats">
        <span>{{ post.views }}</span>
        <span>{{ post.comments }}</span>
        <span>{{ post.likes }}</span>
        <span>{{ post.wordCount }} 字</span>
        <span>{{ estimateReadTime(post.content) }}</span>
      </div>
    </div>
  </router-link>
</template>

<style scoped>
.blog-post {
  display: grid;
  grid-template-columns: 188px minmax(0, 1fr);
  overflow: hidden;
  color: inherit;
  text-decoration: none;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 10px;
  background: #ffffff;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04);
}

.blog-post:hover .blog-post__title {
  color: var(--accent-cyan);
}

.blog-post__cover {
  min-height: 128px;
  background-size: cover;
  background-position: center;
}

.blog-post__body {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  padding: 0.85rem 1rem;
}

.blog-post__meta,
.blog-post__stats {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--text-muted);
}

.blog-post__title {
  margin: 0;
  font-size: 1.28rem;
  letter-spacing: -0.03em;
  color: var(--text-primary);
  transition: color 0.25s ease;
  line-height: 1.3;
}

.blog-post__excerpt {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.65;
  font-size: 0.9rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@media (max-width: 767px) {
  .blog-post {
    grid-template-columns: 1fr;
  }

  .blog-post__cover {
    min-height: 164px;
  }
}
</style>
