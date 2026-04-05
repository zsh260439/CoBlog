import { computed, type Ref } from 'vue'
import { categoryOptions } from '@/config/site'
import type { Article } from '@/types'

export function useCategory(posts: Ref<Article[]>, slug: Ref<string>) {
  const currentCategory = computed(() => categoryOptions.find((item) => item.slug === slug.value) ?? null)

  const filteredPosts = computed(() => {
    const category = currentCategory.value

    if (!category) {
      return []
    }

    return posts.value.filter((post) => post.categorySlug === category.slug)
  })

  return {
    currentCategory,
    filteredPosts
  }
}
