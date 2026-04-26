import { computed, ref, watch, type Ref } from 'vue'
import { getArticleDetail } from '@/servers/article'
import type { Article } from '@/types/article'
import { estimateReadTime, formatDate } from '@/utils'


export function useArticleDetail(slug: Ref<string>) {
  const article = ref<Article | null>(null)  
  const isLoading = ref(true)                 
  const error = ref<string | null>(null)     


  const articleStats = computed(() => {
    if (!article.value) return []

    return [
      { icon: 'Calendar',       text: formatDate(article.value.createdAt, 'iso').slice(0, 16).replace('T', ' ') },
      { icon: 'View',           text: `${article.value.views} 浏览` },
      { icon: 'ChatDotRound',   text: `${article.value.comments} 评论` },
      { icon: 'CollectionTag',  text: article.value.category },
      { icon: 'Document',       text: `${article.value.wordCount} 字` },
      { icon: 'Reading',        text: estimateReadTime(article.value.content) }
    ]
  })

  // 根据 slug 请求文章详情（后端同时返回 previous、next、related）
  const loadArticleDetail = async (currentSlug: string) => {
    isLoading.value = true
    error.value = null

    try {
      const result = await getArticleDetail(currentSlug)
      article.value = result.data ?? null  // data 为 undefined 时兜底 null
    } catch {
      article.value = null
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
        error.value = '文章未找到'
        isLoading.value = false
        return
      }
      await loadArticleDetail(value)
    },
    { immediate: true }
  )

  return { article, isLoading, error, articleStats }
}
