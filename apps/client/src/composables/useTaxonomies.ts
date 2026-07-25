import { computed, ref } from 'vue'
import {
  createCategory,
  createTag,
  deleteCategory,
  deleteTag,
  getCategoryList,
  getTagList,
  updateCategory,
  updateTag,
} from '@/servers/taxonomy'
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
    await loadTaxonomies(true)
    return result.data
  }

  const createTagItem = async (payload: CreateArticleTagPayload) => {
    const result = await createTag(payload)
    await loadTaxonomies(true)
    return result.data
  }

  const ensureCategoryItem = async (payload: CreateArticleCategoryPayload) => {
    const currentCategory = categories.value.find((item) => item.label === payload.label || item.slug === payload.slug)
    if (currentCategory) {
      return currentCategory
    }

    return createCategoryItem(payload)
  }

  const ensureTagItem = async (payload: CreateArticleTagPayload) => {
    const currentTag = tags.value.find((item) => item.label === payload.label || item.slug === payload.slug)
    if (currentTag) {
      return currentTag
    }

    return createTagItem(payload)
  }

  const updateCategoryItem = async (slug: string, payload: CreateArticleCategoryPayload) => {
    const result = await updateCategory(slug, payload)
    await loadTaxonomies(true)
    return result.data
  }

  const updateTagItem = async (slug: string, payload: CreateArticleTagPayload) => {
    const result = await updateTag(slug, payload)
    await loadTaxonomies(true)
    return result.data
  }

  const deleteCategoryItem = async (slug: string) => {
    const result = await deleteCategory(slug)
    await loadTaxonomies(true)
    return result.data
  }

  const deleteTagItem = async (slug: string) => {
    const result = await deleteTag(slug)
    await loadTaxonomies(true)
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
    ensureCategoryItem,
    ensureTagItem,
    updateCategoryItem,
    updateTagItem,
    deleteCategoryItem,
    deleteTagItem,
  }
}
