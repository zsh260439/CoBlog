import { computed, ref } from 'vue'
import { getMockArticles } from '@/mocks/articles'
import type { Article } from '@/types'

export function usePosts(immediate = true) {
  const posts = ref<Article[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const loadPosts = () => {
    error.value = null
    posts.value = getMockArticles()
  }

  if (immediate) {
    loadPosts()
  }

  const featuredPost = computed(() => posts.value[0] ?? null)

  return {
    posts,
    isLoading,
    error,
    featuredPost,
    loadPosts
  }
}
