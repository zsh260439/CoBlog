<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useThrottleFn, useWindowScroll } from '@vueuse/core'
import PostToc from '@/components/blog/PostToc.vue'
import MarkdownViewer from '@/components/MarkdownViewer.vue'
import { findArticleBySlug, getAdjacentArticles, getRelatedArticles } from '@/mocks/articles'
import type { Article } from '@/types'
import { estimateReadTime, extractHeadings, formatDate } from '@/utils'

const route = useRoute()
const router = useRouter()
const { y } = useWindowScroll()

const post = ref<Article | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)
const activeHeadingId = ref('')

const heroStyle = computed(() => {
  if (!post.value?.coverImage) {
    return undefined
  }

  return {
    backgroundImage: `linear-gradient(180deg, rgba(13, 18, 28, 0.18), rgba(13, 18, 28, 0.56)), url(${post.value.coverImage})`
  }
})

const formattedDate = computed(() => {
  if (!post.value) {
    return ''
  }

  return formatDate(post.value.createdAt, 'long')
})

const estimatedReadTime = computed(() => {
  if (!post.value) {
    return '1 分钟阅读'
  }

  return estimateReadTime(post.value.content)
})

const tocItems = computed(() => {
  if (!post.value) {
    return []
  }

  return extractHeadings(post.value.content)
})

const articleStats = computed(() => {
  if (!post.value) {
    return []
  }

  return [
    `${formatDate(post.value.createdAt, 'iso').slice(0, 16).replace('T', ' ')}`,
    `${post.value.views} 浏览`,
    `${post.value.comments} 评论`,
    `${post.value.wordCount} 字`,
    estimatedReadTime.value
  ]
})

const relatedArticles = computed(() => {
  if (!post.value) {
    return []
  }

  return getRelatedArticles(post.value.slug, 6)
})

const adjacentArticles = computed(() => {
  if (!post.value) {
    return {
      previous: null,
      next: null
    }
  }

  return getAdjacentArticles(post.value.slug)
})

const refreshActiveHeading = useThrottleFn(() => {
  if (!tocItems.value.length) {
    activeHeadingId.value = ''
    return
  }

  const offset = 136
  let currentId = tocItems.value[0].id

  tocItems.value.forEach((item) => {
    const element = document.getElementById(item.id)

    if (!element) {
      return
    }

    if (element.getBoundingClientRect().top <= offset) {
      currentId = item.id
    }
  })

  activeHeadingId.value = currentId
}, 80)

const syncPost = async (slug: string) => {
  isLoading.value = true
  error.value = null

  const article = findArticleBySlug(slug)

  if (!article) {
    post.value = null
    error.value = '文章未找到'
    isLoading.value = false
    return
  }

  post.value = article
  await nextTick()
  refreshActiveHeading()
  isLoading.value = false
}

watch(
  () => route.params.slug,
  async (value) => {
    if (typeof value !== 'string') {
      post.value = null
      error.value = '文章未找到'
      isLoading.value = false
      return
    }

    await syncPost(value)
  },
  { immediate: true }
)

watch([y, tocItems], () => {
  refreshActiveHeading()
})
</script>

<template>
  <div class="article-view">
    <div v-if="isLoading" class="status-screen">
      <div class="status-card">加载文章中...</div>
    </div>

    <div v-else-if="error" class="status-screen">
      <div class="status-card">
        <span class="status-card__code">404</span>
        <h1>文章未找到</h1>
        <p>{{ error }}</p>
        <button class="status-card__button" @click="router.push('/blog')">返回博客</button>
      </div>
    </div>

    <template v-else-if="post">
      <section class="article-hero">
        <div class="article-hero__media" :style="heroStyle"></div>
        <div class="article-hero__veil"></div>
        <div class="article-hero__mist"></div>

        <div class="article-hero__inner">
          <h1 class="article-hero__title">{{ post.title }}</h1>

          <div class="article-hero__meta">
            <span v-for="item in articleStats" :key="item">{{ item }}</span>
          </div>
        </div>
      </section>

      <section class="article-shell page-content-reveal">
        <div class="article-main">
          <article class="article-card">
            <div class="article-summary">
              <span class="article-summary__icon">▣</span>
              <p>{{ post.summary }}</p>
            </div>

            <div class="article-body">
              <MarkdownViewer :content="post.content" />
            </div>
          </article>

          <section class="article-card article-card--nav" v-if="adjacentArticles.previous || adjacentArticles.next">
            <div class="article-nav-grid">
              <router-link
                v-if="adjacentArticles.previous"
                :to="{ name: 'article', params: { slug: adjacentArticles.previous.slug } }"
                class="article-nav-item"
              >
                <span class="article-nav-item__label">上一篇</span>
                <strong>{{ adjacentArticles.previous.title }}</strong>
              </router-link>

              <router-link
                v-if="adjacentArticles.next"
                :to="{ name: 'article', params: { slug: adjacentArticles.next.slug } }"
                class="article-nav-item"
              >
                <span class="article-nav-item__label">下一篇</span>
                <strong>{{ adjacentArticles.next.title }}</strong>
              </router-link>
            </div>
          </section>

          <section class="article-card article-card--related" v-if="relatedArticles.length">
            <h3>相关文章</h3>

            <router-link
              v-for="item in relatedArticles"
              :key="item.slug"
              :to="{ name: 'article', params: { slug: item.slug } }"
              class="related-link"
            >
              {{ item.title }}
            </router-link>
          </section>
        </div>

        <aside class="article-side">
          <PostToc :items="tocItems" :active-id="activeHeadingId" />
        </aside>
      </section>
    </template>
  </div>
</template>

<style scoped>
.article-view {
  background: linear-gradient(180deg, #eff3f9 0%, #ffffff 34%, #ffffff 100%);
}

.status-screen {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 2rem;
}

.status-card,
.article-card {
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 10px;
  background: #ffffff;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04);
}

.status-card {
  width: min(100%, 32rem);
  padding: 2rem;
  text-align: center;
}

.status-card__code {
  display: inline-block;
  margin-bottom: 1rem;
  font-family: var(--font-mono);
  color: var(--text-muted);
}

.status-card h1 {
  margin: 0 0 0.75rem;
}

.status-card p {
  margin: 0;
  color: var(--text-secondary);
}

.status-card__button {
  margin-top: 1.5rem;
  border: none;
  border-radius: 999px;
  background: var(--accent-cyan);
  color: #ffffff;
  padding: 0.85rem 1.3rem;
  font-family: var(--font-mono);
  cursor: pointer;
}

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

.article-shell {
  position: relative;
  z-index: 2;
  width: min(100%, 1120px);
  margin: -28px auto 0;
  padding: 0 2rem 5rem;
  display: grid;
  grid-template-columns: minmax(0, 1.62fr) 240px;
  gap: 1.5rem;
}

.article-main,
.article-side {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.article-card {
  padding: 1.6rem;
}

.article-summary {
  display: grid;
  grid-template-columns: 20px minmax(0, 1fr);
  gap: 0.85rem;
  padding: 1rem 1.1rem;
  border-left: 3px solid #313640;
  border-radius: 0 6px 6px 0;
  background: #f8fafc;
  color: var(--text-secondary);
}

.article-summary__icon {
  margin-top: 0.12rem;
  color: #8b95a7;
}

.article-summary p {
  margin: 0;
  line-height: 1.85;
}

.article-body {
  margin-top: 1.6rem;
}

.article-card--nav,
.article-card--related {
  padding-top: 1.35rem;
}

.article-nav-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.article-nav-item,
.related-link {
  color: inherit;
  text-decoration: none;
}

.article-nav-item {
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid var(--border-light);
  background: #fafbfd;
}

.article-nav-item__label {
  display: block;
  margin-bottom: 0.5rem;
  font-family: var(--font-mono);
  font-size: 0.68rem;
  color: var(--text-muted);
}

.article-nav-item strong {
  color: var(--text-primary);
  line-height: 1.7;
}

.article-card--related h3 {
  margin: 0 0 1rem;
  font-size: 1.34rem;
}

.related-link {
  display: block;
  padding: 0.95rem 0;
  border-top: 1px solid var(--border-light);
  color: var(--text-secondary);
  line-height: 1.7;
}

.related-link:first-of-type {
  border-top: none;
  padding-top: 0;
}

@media (max-width: 1024px) {
  .article-shell {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 767px) {
  .article-hero {
    min-height: 360px;
  }

  .article-hero__inner {
    padding: calc(var(--header-height) + 2.2rem) 1.25rem 6rem;
  }

  .article-shell {
    margin-top: -12px;
    padding: 0 1.25rem 4rem;
  }

  .article-nav-grid {
    grid-template-columns: 1fr;
  }
}
</style>
