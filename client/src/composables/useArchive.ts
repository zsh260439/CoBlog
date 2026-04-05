import { computed, type Ref } from 'vue'
import type { Article } from '@/types'

export function useArchive(posts: Ref<Article[]>) {
  const archiveGroups = computed(() => {
    const groups = new Map<string, Article[]>()

    posts.value.forEach((post) => {
      const year = new Date(post.createdAt).getFullYear().toString()
      const currentGroup = groups.get(year) ?? []
      currentGroup.push(post)
      groups.set(year, currentGroup)
    })

    return [...groups.entries()].map(([year, items]) => ({
      year,
      posts: items.sort((left, right) => +new Date(right.createdAt) - +new Date(left.createdAt))
    }))
  })

  const formatArchiveDate = (date: string) => {
    const parsed = new Date(date)
    const month = `${parsed.getMonth() + 1}`.padStart(2, '0')
    const day = `${parsed.getDate()}`.padStart(2, '0')

    return `${month}-${day}`
  }

  return {
    archiveGroups,
    formatArchiveDate
  }
}
