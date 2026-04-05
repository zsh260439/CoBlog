import { computed, nextTick, ref, watch, type Ref } from 'vue'
import { useThrottleFn, useWindowScroll } from '@vueuse/core'
import { findArticleBySlug, getAdjacentArticles, getRelatedArticles } from '@/mocks/articles'
import type { Article } from '@/types'
import { estimateReadTime, extractHeadings, formatDate } from '@/utils'

export function usePostDetail(slug: Ref<string>) {
  const { y } = useWindowScroll()

  const post = ref<Article | null>(null)
  const isLoading = ref(true)
  const error = ref<string | null>(null)
  const activeHeadingId = ref('')

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
      return { previous: null, next: null }
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

  const syncPost = async (currentSlug: string) => {
    isLoading.value = true
    error.value = null

    const article = findArticleBySlug(currentSlug)

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
    slug,
    async (value) => {
      if (!value) {
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

  return {
    post,
    isLoading,
    error,
    activeHeadingId,
    formattedDate,
    estimatedReadTime,
    tocItems,
    articleStats,
    relatedArticles,
    adjacentArticles
  }
}
