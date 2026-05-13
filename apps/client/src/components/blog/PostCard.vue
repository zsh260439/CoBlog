<script setup lang="ts">
import { computed } from 'vue'
import type { ArticleCardProps } from '@/types/article'
import { estimateReadTime, formatDate } from '@/utils'
import { Clock, Document, Reading, View } from '@element-plus/icons-vue';

const props = defineProps<ArticleCardProps>()
const coverStyle = computed(() => {
  if (!props.article.coverImage) {
    return undefined
  }

  return {
    backgroundImage: `url(${props.article.coverImage})`
  }
})

// 展示层需要的摘要、日期和阅读时长都在这里预处理。
const excerpt = computed(() => props.article.excerpt)
const publishedAt = computed(() => formatDate(props.article.createdAt, 'long'))
const readTime = computed(() => estimateReadTime(props.article.content))
const wordCount = computed(() => props.article.wordCount)
const view = computed(() => props.article.views)
</script>

<template>
  <router-link
    :to="{ name: 'article', params: { slug: article.slug } }"
    class="post-card"
    :class="{ 'post-card--plain': !article.coverImage }"
  >
    <div v-if="article.coverImage" class="post-card__media" :style="coverStyle"></div>

    <div class="post-card__body">
      <div class="post-card__meta">
        <span class="post-card__category-inline">{{ article.category }}</span>
        <span>{{ publishedAt }}</span>
        <span class="post-card__dot"></span>
        <span style="display: flex; align-items: center;">
          <el-icon style="font-size: 0.8rem; margin-right: 4px;"><Clock /></el-icon>
          {{ readTime }}
        </span>
      </div>

      <h2 class="post-card__title">{{ article.title }}</h2>
      <p class="post-card__excerpt">{{ excerpt }}</p>

      <div class="post-card__footer">
        <span style="color:var(--text-secondary); font-size: 0.7rem;">
          <el-icon style="font-size: 0.7rem; margin-right: 4px; color: var(--text-muted); "><Document /></el-icon>
          {{ wordCount }} 字
        </span>
       <span style="color:var(--text-secondary); font-size: 0.7rem;display: flex; align-items: center; margin-bottom:2px">
        <el-icon style="font-size: 0.7rem; margin-right: 4px; color: var(--text-muted); "><View /></el-icon>
        {{ view }} 浏览
       </span>
        <span class="post-card__action">
          <el-icon style="font-size: 0.8rem;color: var(--text-muted);"><Reading /></el-icon>
          点击阅读全文
        </span>

      </div>
    </div>
  </router-link>
</template>

<style scoped>
.post-card {
  display: grid;
  grid-template-columns: minmax(0, 220px) minmax(0, 1fr);
  overflow: hidden;
  border: 1px solid var(--border-light);
  border-radius: 10px;
  background: #ffffff;
  box-shadow: 0 8px 20px rgba(17, 17, 17, 0.04);
  text-decoration: none;
  transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

.post-card:hover {
  transform: translateY(-2px);
  border-color: rgba(17, 17, 17, 0.14);
  box-shadow: 0 12px 28px rgba(17, 17, 17, 0.06);
}

.post-card--plain {
  grid-template-columns: 1fr;
}

.post-card__media {
  position: relative;
  min-height: 172px;
  background-size: cover;
  background-position: center;
  border-right: 1px solid rgba(17, 17, 17, 0.06);
}

.post-card__body {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 1rem 1.35rem;
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
  font-size: 0.72rem;
  color: var(--text-muted);
}

.post-card__category-inline {
  display: inline-flex;
  align-items: center;
  padding-right: 0.1rem;
  color: #4f5560;
}

.post-card__dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(17, 17, 17, 0.3);
}

.post-card__title {
  margin: 0;
  font-size: clamp(1.18rem, 2vw, 1.72rem);
  line-height: 1.28;
  color: var(--text-primary);
  letter-spacing: -0.03em;
}

.post-card__excerpt {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.8;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-card__action {
  margin-left: auto;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-secondary);
}

@media (max-width: 900px) {
  .post-card {
    grid-template-columns: 1fr;
  }

  .post-card__media {
    min-height: 210px;
    border-right: none;
    border-bottom: 1px solid rgba(17, 17, 17, 0.06);
  }

  .post-card__action {
    margin-left: 0;
  }
}

@media (max-width: 767px) {
  .post-card {
    border-radius: 10px;
  }

  .post-card__body {
    padding: 1rem 1.05rem;
  }
}
</style>
