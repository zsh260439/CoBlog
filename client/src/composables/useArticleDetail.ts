import { computed, ref, watch, type Ref } from 'vue'
import { getArticleDetail, getArticleList } from '@/servers/article'
import type { Article } from '@/types/article'
import { estimateReadTime, formatDate } from '@/utils'

export function useArticleDetail(slug: Ref<string>) {
  const article = ref<Article | null>(null)
  const articles = ref<Article[]>([])
  const isLoading = ref(true)
  const error = ref<string | null>(null)

  const articleStats = computed(() => {
    if (!article.value) {
      return []
    }

    return [
      {
        icon: 'Calendar',
        text: formatDate(article.value.createdAt, 'iso').slice(0, 16).replace('T', ' ')
      },
      {
        icon: 'View',
        text: `${article.value.views} 浏览`
      },
      {
        icon: 'ChatDotRound',
        text: `${article.value.comments} 评论`
      },
      {
        icon: 'CollectionTag',
        text: article.value.category
      },
      {
        icon: 'Document',
        text: `${article.value.wordCount} 字`
      },
      {
        icon: 'Reading',
        text: estimateReadTime(article.value.content)
      }
    ]
  })

  const relatedArticles = computed(() => {
    if (!article.value) {
      return []
    }

    return articles.value
      .filter((item) => item.slug !== article.value?.slug)
      .map((item) => ({
        article: item,
        score: item.categorySlug === article.value?.categorySlug ? 1 : 0
      }))
      .sort((left, right) => right.score - left.score || +new Date(right.article.createdAt) - +new Date(left.article.createdAt))
      .slice(0, 6)
      .map((item) => item.article)
  })

  const adjacentArticles = computed(() => {
    if (!article.value) {
      return {
        previous: null,
        next: null
      }
    }

    const currentIndex = articles.value.findIndex((item) => item.slug === article.value?.slug)

    if (currentIndex === -1) {
      return {
        previous: null,
        next: null
      }
    }

    return {
      previous: articles.value[currentIndex - 1] ?? null,
      next: articles.value[currentIndex + 1] ?? null
    }
  })

  const loadArticleDetail = async (currentSlug: string) => {
    isLoading.value = true
    error.value = null

    try {
      const [detailResult, listResult] = await Promise.all([
        getArticleDetail(currentSlug),
        getArticleList()
      ])

      article.value = detailResult.data
      articles.value = listResult.data
    } catch {
      article.value = null
      articles.value = []
      error.value = '文章未找到'
    } finally {
      isLoading.value = false
    }
  }

  watch(
    slug,
    async (value) => {
      if (!value) {
        article.value = null
        articles.value = []
        error.value = '文章未找到'
        isLoading.value = false
        return
      }

      await loadArticleDetail(value)
    },
    { immediate: true }
  )

  return {
    article,
    articles,
    isLoading,
    error,
    articleStats,
    relatedArticles,
    adjacentArticles
  }
}
