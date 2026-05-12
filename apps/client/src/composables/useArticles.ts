import { ref } from 'vue'
import { getArticleList } from '@/servers/article'
import type { Article } from '@/types/article'

const articles = ref<Article[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
let loadingPromise: Promise<void> | null = null

export function useArticles() {
  const loadArticles = async (force = false) => {
    if (!force && articles.value.length) {
      return
    }

    if (loadingPromise) {
      return loadingPromise
    }

    isLoading.value = true
    error.value = null

    loadingPromise = (async () => {
      try {
        const result = await getArticleList()
        articles.value = result.data ?? []
      } catch {
        articles.value = []
        error.value = '文章加载失败'
      } finally {
        isLoading.value = false
        loadingPromise = null
      }
    })()

    return loadingPromise
  }

  const setArticles = (nextArticles: Article[]) => {
    articles.value = nextArticles
  }

  return {
    articles,
    isLoading,
    error,
    loadArticles,
    setArticles
  }
}
