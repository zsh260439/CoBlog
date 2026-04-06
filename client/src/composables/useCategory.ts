import { computed, ref, watch, type Ref } from 'vue'
import { categoryOptions } from '@/config/site'
import { getArticlesByCategory } from '@/servers/article'
import type { Article } from '@/types'

export function useCategory(slug: Ref<string>) {
  const articles = ref<Article[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const currentCategory = computed(() => {
    return categoryOptions.find((item) => item.slug === slug.value) ?? null
  })

  const loadCategoryArticles = async (categorySlug: string) => {
    if (!categorySlug) {
      articles.value = []
      error.value = '分类不存在'
      return
    }

    isLoading.value = true
    error.value = null

    try {
      const result = await getArticlesByCategory(categorySlug)
      articles.value = result.data
    } catch (err) {
      console.error(err)
      articles.value = []
      error.value = '分类文章加载失败'
    } finally {
      isLoading.value = false
    }
  }

  watch(
    slug,
    async (value) => {
      await loadCategoryArticles(value)
    },
    { immediate: true },
  )

  return {
    currentCategory,
    articles,
    isLoading,
    error,
    loadCategoryArticles,
  }
}
