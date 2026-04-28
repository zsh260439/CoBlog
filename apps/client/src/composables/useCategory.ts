import { computed, ref, watch, type Ref } from 'vue'
import { getArticlesByCategory } from '@/servers/article'
import type { Article } from '@/types/article'
import { createSlugFromText } from '@/utils'

export function useCategory(slug: Ref<string>) {
  const articles = ref<Article[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const currentCategory = computed(() => {
    if (articles.value[0]) {
      return {
        label: articles.value[0].category,
        slug: articles.value[0].categorySlug,
      }
    }

    if (!slug.value) {
      return null
    }

    return {
      label: slug.value,
      slug: createSlugFromText(slug.value, 32),
    }
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
      articles.value = result.data ?? []
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
  }
}
