import { computed, ref, watch, type Ref } from 'vue'
import { getArticlesByTag } from '@/servers/article'
import type { Article } from '@/types/article'

export function useTag(tag: Ref<string>) {
  const articles = ref<Article[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const currentTag = computed(() => tag.value || '')

  const loadTagArticles = async (tagValue: string) => {
    if (!tagValue) {
      articles.value = []
      error.value = '标签不存在'
      return
    }

    isLoading.value = true
    error.value = null

    try {
      const result = await getArticlesByTag(tagValue)
      articles.value = result.data
    } catch (err) {
      console.error(err)
      articles.value = []
      error.value = '标签文章加载失败'
    } finally {
      isLoading.value = false
    }
  }

  watch(
    tag,
    async (value) => {
      await loadTagArticles(value)
    },
    { immediate: true },
  )

  return {
    currentTag,
    articles,
    isLoading,
    error,
    loadTagArticles,
  }
}
