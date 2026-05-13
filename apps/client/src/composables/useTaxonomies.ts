import { computed, ref } from 'vue'
import { createCategory, createTag, getCategoryList, getTagList } from '@/servers/taxonomy'
import type {
  ArticleCategory,
  ArticleTag,
  CreateArticleCategoryPayload,
  CreateArticleTagPayload,
} from '@/types/article'

const categories = ref<ArticleCategory[]>([])
const tags = ref<ArticleTag[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
let loadingPromise: Promise<void> | null = null

export function useTaxonomies() {
  const categoryOptions = computed(() => categories.value)
  const tagOptions = computed(() => tags.value)

  const loadTaxonomies = async (force = false) => {
    if (!force && categories.value.length && tags.value.length) {
      return
    }

    if (loadingPromise) {
      return loadingPromise
    }

    isLoading.value = true
    error.value = null

    loadingPromise = (async () => {
      try {
        const [categoryResult, tagResult] = await Promise.all([getCategoryList(), getTagList()])
        categories.value = categoryResult.data
        tags.value = tagResult.data
      } catch (currentError) {
        console.error(currentError)
        error.value = '分类或标签加载失败'
      } finally {
        isLoading.value = false
        loadingPromise = null
      }
    })()

    return loadingPromise
  }

  const createCategoryItem = async (payload: CreateArticleCategoryPayload) => {
    const result = await createCategory(payload)
    categories.value = [...categories.value, result.data]
    return result.data
  }

  const createTagItem = async (payload: CreateArticleTagPayload) => {
    const result = await createTag(payload)
    tags.value = [...tags.value, result.data]
    return result.data
  }

  return {
    categories: categoryOptions,
    tags: tagOptions,
    isLoading,
    error,
    loadTaxonomies,
    createCategoryItem,
    createTagItem,
  }
}
