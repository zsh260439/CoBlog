import type { ArticleFormData } from '@/types/article'
import { createSlugFromText } from './slug'

export function estimateReadTime(content: string): string {
  const plainText = content.replace(/[`#>*_\-\[\]()!]/g, '').replace(/\s+/g, '')
  const minutes = Math.max(1, Math.ceil(plainText.length / 450))
  return `${minutes} 分钟阅读`
}

export function sanitizeArticleFormPayload(payload: ArticleFormData): ArticleFormData {
  const normalizedCategorySlug =
    payload.categorySlug?.trim() ||
    createSlugFromText(payload.category.trim(), 32)
  const normalizedContent = payload.content.trim()
  const normalizedExcerpt = payload.excerpt.trim()
  const normalizedSummary = payload.summary?.trim() || normalizedExcerpt
  const normalizedCoverImage = payload.coverImage?.trim()

  return {
    title: payload.title.trim(),
    slug: payload.slug?.trim(),
    content: normalizedContent,
    excerpt: normalizedExcerpt,
    summary: normalizedSummary,
    category: payload.category.trim(),
    categorySlug: normalizedCategorySlug,
    tags: (payload.tags ?? []).map((tag) => tag.trim()).filter(Boolean),
    ...(normalizedCoverImage ? { coverImage: normalizedCoverImage } : {}),
  }
}
