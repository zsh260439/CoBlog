import type { Article } from '@/types'
import { categoryOptions } from '@/config/site'

export function estimateReadTime(content: string): string {
  const plainText = content.replace(/[`#>*_\-\[\]()!]/g, '').replace(/\s+/g, '')
  const minutes = Math.max(1, Math.ceil(plainText.length / 450))

  return `${minutes} 分钟阅读`
}

export function summarizeCategories(posts: Article[]) {
  const categoryCount = new Map<string, { label: string; slug: string; count: number }>()

  posts.forEach((post) => {
    const currentEntry = categoryCount.get(post.categorySlug)

    if (currentEntry) {
      currentEntry.count += 1
      return
    }

    categoryCount.set(post.categorySlug, {
      label: post.category,
      slug: post.categorySlug,
      count: 1
    })
  })

  return categoryOptions
    .map((item) => categoryCount.get(item.slug) ?? { label: item.label, slug: item.slug, count: 0 })
    .filter((item) => item.count > 0)
}
