import { computed, ref } from 'vue'
import { getArticleList } from '@/servers/article'
import type { Article } from '@/types/article'

const articles = ref<Article[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

export function useArticles(immediate = true) {
  const loadArticles = async () => {
    isLoading.value = true
    error.value = null

    try {
      const result = await getArticleList()
      articles.value = result.data ?? []
    } catch {
      articles.value = []
      error.value = '文章加载失败'
    } finally {
      isLoading.value = false
    }
  }

  if (immediate) {
    loadArticles()
  }

  const featuredArticle = computed(() => articles.value[0] ?? null)

  const setArticles = (nextArticles: Article[]) => {
    articles.value = nextArticles
  }

  return {
    articles,
    isLoading,
    error,
    featuredArticle,
    loadArticles,
    setArticles
  }
}
