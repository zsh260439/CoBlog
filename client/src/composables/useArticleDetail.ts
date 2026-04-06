import { computed, nextTick, ref, watch, type Ref } from 'vue'
import { useThrottleFn, useWindowScroll } from '@vueuse/core'
import { getArticleDetail, getArticleList } from '@/servers/article'
import type { Article } from '@/types'
import { estimateReadTime, extractHeadings, formatDate } from '@/utils'

export function useArticleDetail(slug: Ref<string>) {
  const { y } = useWindowScroll()

  const article = ref<Article | null>(null)
  const articles = ref<Article[]>([])
  const isLoading = ref(true)
  const error = ref<string | null>(null)
  const activeHeadingId = ref('')

  const tocItems = computed(() => {
    if (!article.value) {
      return []
    }

    return extractHeadings(article.value.content)
  })

  const articleStats = computed(() => {
    if (!article.value) {
      return []
    }

    return [
      `${formatDate(article.value.createdAt, 'iso').slice(0, 16).replace('T', ' ')}`,
      `${article.value.views} 浏览`,
      `${article.value.comments} 评论`,
      `${article.value.wordCount} 字`,
      estimateReadTime(article.value.content)
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

      await nextTick()
      refreshActiveHeading()
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

  watch([y, tocItems], () => {
    refreshActiveHeading()
  })

  return {
    article,
    articles,
    isLoading,
    error,
    activeHeadingId,
    tocItems,
    articleStats,
    relatedArticles,
    adjacentArticles
  }
}
