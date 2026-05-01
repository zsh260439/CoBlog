<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useThrottleFn, useWindowScroll } from '@vueuse/core'
import { useRoute, useRouter } from 'vue-router'
import ArticleHero from '@/views/postView/components/ArticleHero.vue'
import ArticleToc from '@/views/postView/components/ArticleToc.vue'
import MarkdownViewer from '@/views/postView/components/MarkdownViewer.vue'
import { useArticleDetail } from '@/composables/useArticleDetail'
import type { MarkdownHeading } from '@/types/content'
import { MagicStick } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const { y } = useWindowScroll()
const currentSlug = computed(() => String(route.params.slug ?? ''))
const previewId = computed(() => `article-preview-${currentSlug.value || 'detail'}`)
const tocItems = ref<MarkdownHeading[]>([])
const activeHeadingId = ref('')

const {
  article,
  isLoading,
  error,
  articleStats
} = useArticleDetail(currentSlug)

const refreshActiveHeading = useThrottleFn(() => {
  if (!tocItems.value.length) {
    activeHeadingId.value = ''
    return
  }

  const offset = 136
  let currentId = ''
  const viewportBottom = window.scrollY + window.innerHeight
  const documentHeight = document.documentElement.scrollHeight

  tocItems.value.forEach((item) => {
    const element = document.getElementById(item.id)

    if (!element) {
      return
    }

    if (element.getBoundingClientRect().top <= offset) {
      currentId = item.id
    }
  })

  const lastItem = tocItems.value[tocItems.value.length - 1]
  const lastEl = lastItem ? document.getElementById(lastItem.id) : null

  if (currentId) {
    activeHeadingId.value = currentId
    return
  }

  if (viewportBottom >= documentHeight - 12 && lastEl && lastEl.getBoundingClientRect().top > offset) {
    activeHeadingId.value = lastItem.id
    return
  }

  activeHeadingId.value = ''
}, 80)

const handleCatalogChange = async (items: MarkdownHeading[]) => {
  tocItems.value = items
  await nextTick()
  refreshActiveHeading()
}

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

    <template v-else-if="article">
      <ArticleHero :article="article" :stats="articleStats" />

      <section class="article-shell page-content-reveal">
        <div class="article-main">
          <article class="article-card article-card--content">
            <div class="article-summary">
              <span class="article-summary__icon">▣</span>
                <p>{{ article.summary }}</p>
                  <div class="ai-badge">
                  <el-icon class="ai-icon" size="small"><MagicStick /></el-icon>
                          该文章摘要由AI生成
                </div>
            </div>
            <div class="article-body">
              <MarkdownViewer
                :content="article.content"
                :article-title="article.title"
                :editor-id="previewId"
                @catalog-change="handleCatalogChange"
              />
            </div>
          </article>

          <section class="article-card article-card--nav" v-if="article.previous || article.next">
            <div class="article-nav-grid">
              <router-link
                v-if="article.previous"
                :to="{ name: 'article', params: { slug: article.previous.slug } }"
                class="article-nav-item"
              >
                <span class="article-nav-item__label">上一篇</span>
                <strong>{{ article.previous.title }}</strong>
              </router-link>

              <router-link
                v-if="article.next"
                :to="{ name: 'article', params: { slug: article.next.slug } }"
                class="article-nav-item"
              >
                <span class="article-nav-item__label">下一篇</span>
                <strong>{{ article.next.title }}</strong>
              </router-link>
            </div>
          </section>

          <section class="article-card article-card--related" v-if="article.related?.length">
            <h3>相关文章</h3>

            <router-link
              v-for="item in article.related"
              :key="item.slug"
              :to="{ name: 'article', params: { slug: item.slug } }"
              class="related-link"
            >
              {{ item.title }}
            </router-link>
          </section>
        </div>

        <aside class="article-side">
          <ArticleToc :items="tocItems" :active-id="activeHeadingId" />
        </aside>
      </section>
    </template>
  </div>
</template>

<style scoped lang="scss">
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
  width: 100%;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 10px;
  background: #ffffff;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04);

}

.status-card {
  width: min(100vw, 32rem);
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

.article-shell {
  position: relative;
  z-index: 2;
  width: min(100vw, 1120px);
  margin: -28px auto 0;
  padding: 0 2rem 5rem;
  display: grid;
  grid-template-columns: minmax(0, 1.62fr) 240px;
  gap: 1.5rem;
}

.article-main,
.article-side {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
}

.article-card {
  padding: 1.6rem;
}

.article-summary {
  position: relative;
  display: grid;
  grid-template-columns: 8px minmax(0, 1fr);
  gap: 0.5rem;
  padding: 1rem 1rem 1.8rem;
  border-left: 3px solid #313640;
  border-radius: 0 6px 6px 0;
  background: #f8fafc;
  color: var(--text-secondary);
  margin: 20px;
}
 .article-summary .ai-badge {
   position: absolute;
   bottom: 0;
   right: 1rem;
   background: #f8fafc;
   color: var(--text-secondary);
   font-size:0.9rem;
   opacity: 0.7;
   }
.article-summary__icon {
  margin-top: 0.12rem;
  color: #8b95a7;
}

.article-summary p {
  margin: 0;
  min-width: 0;
  line-height: 1.82;
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.article-body {
  margin-top: 1.6rem;
  margin-right: 20px;
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
  .article-view {
    background: #ffffff;
  }

  .article-shell {
    margin-top: -32px;
    width: min(100vw, 680px);
    padding: 0 0.9rem 2.8rem;
  }

  .article-card {
    padding: 1.1rem;
    border-radius: 12px;
  }

  .article-card--content {
    width: 100%;
    padding: 1.1rem;
    border: none;
    border-radius: 0;
    background: transparent;
    box-shadow: none;
    position: relative;
    z-index: 2;
  }

   .article-summary {
     margin: 0 8px;
     padding: 0.85rem 0.85rem 1.6rem;
   }
  .article-summary__icon {
    margin-top: 0.14rem;
    font-size: 0.8rem;
   }

   .article-summary p {
      font-size: 0.96rem;
      min-width: 0;
       white-space: normal;
   overflow-wrap: anywhere;
     word-break: break-word;
    }

  




.article-body {
    margin-top: 1.4rem;
    padding: 1rem;
  }

  .article-body :deep(.md-editor-preview) {
    font-size: 1rem;
    line-height: 1.95;
  }

  .article-body :deep(.md-editor-preview h1) {
    margin-top: 0;
    font-size: 2rem;
    line-height: 1.22;
  }

  .article-body :deep(.md-editor-preview h2) {
    font-size: 1.5rem;
    line-height: 1.28;
  }

  .article-body :deep(.md-editor-preview h3) {
    font-size: 1.2rem;
    line-height: 1.35;
  }

  .article-body :deep(.md-editor-preview pre) {
    border-radius: 14px;
  }

  .article-body :deep(.md-editor-preview img) {
    border-radius: 14px;
  }

  .article-side {
    display: none;
  }

  .article-card--nav,
  .article-card--related {
    padding-top: 1rem;
    background: #ffffff;
  }

  .article-card--related h3 {
    font-size: 1.15rem;
  }

  .article-nav-grid {
    grid-template-columns: 1fr;
  }
}
</style>
