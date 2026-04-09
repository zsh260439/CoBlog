import type { Article } from '@/types/article'
import type { CategorySummaryItem } from '@/types/article/taxonomy'
import { categoryOptions } from '@/config/site'
import type { ArchiveGroup, ArticleFormData } from '@/types/article'
import { createSlugFromText } from './slug'

export function estimateReadTime(content: string): string {
  const plainText = content.replace(/[`#>*_\-\[\]()!]/g, '').replace(/\s+/g, '')
  const minutes = Math.max(1, Math.ceil(plainText.length / 450))

  return `${minutes} 分钟阅读`
}

function stripMarkdown(content: string) {
  return content.replace(/[`#>*_\-\[\]()!]/g, '').replace(/\s+/g, '')
}

function normalizeDate(value: unknown) {
  if (!value) {
    return new Date().toISOString()
  }

  const date = new Date(String(value))
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
}

function normalizeCategorySlug(categorySlug: unknown, category: unknown) {
  const normalizedSlug = typeof categorySlug === 'string' ? categorySlug.trim() : ''
  if (normalizedSlug) {
    return normalizedSlug
  }

  const normalizedCategory = typeof category === 'string' ? category.trim() : ''
  const matchedCategory = categoryOptions.find((item) => item.label === normalizedCategory)
  return matchedCategory?.slug ?? createSlugFromText(normalizedCategory, 32)
}

export function normalizeArticle(article: Partial<Article>): Article {
  const content = typeof article.content === 'string' ? article.content : ''
  const excerpt = typeof article.excerpt === 'string' && article.excerpt.trim() ? article.excerpt.trim() : content.slice(0, 140)
  const summary = typeof article.summary === 'string' && article.summary.trim() ? article.summary.trim() : excerpt
  const createdAt = normalizeDate(article.createdAt)
  const updatedAt = normalizeDate(article.updatedAt ?? article.createdAt)
  const normalizedTags = Array.isArray(article.tags)
    ? article.tags.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    : []

  return {
    _id: typeof article._id === 'string' ? article._id : String(article._id ?? ''),
    slug: typeof article.slug === 'string' ? article.slug : '',
    title: typeof article.title === 'string' ? article.title : '未命名文章',
    content,
    excerpt,
    summary,
    category: typeof article.category === 'string' ? article.category : '未分类',
    categorySlug: normalizeCategorySlug(article.categorySlug, article.category),
    tags: normalizedTags,
    coverImage: typeof article.coverImage === 'string' && article.coverImage.trim() ? article.coverImage.trim() : undefined,
    createdAt,
    updatedAt,
    views: typeof article.views === 'number' ? article.views : 0,
    comments: typeof article.comments === 'number' ? article.comments : 0,
    likes: typeof article.likes === 'number' ? article.likes : 0,
    wordCount: typeof article.wordCount === 'number' && article.wordCount > 0 ? article.wordCount : stripMarkdown(content).length,
  }
}

export function normalizeArticles(articles: Array<Partial<Article>>) {
  return articles.map((article) => normalizeArticle(article))
}

export function normalizeArchiveGroups(groups: ArchiveGroup[]) {
  return groups.map((group) => ({
    year: String(group.year),
    articles: normalizeArticles(group.articles as Array<Partial<Article>>),
  }))
}

export function sanitizeArticleFormPayload(payload: ArticleFormData): ArticleFormData {
  const normalizedCategorySlug =
    payload.categorySlug?.trim() ||
    categoryOptions.find((item) => item.label === payload.category.trim())?.slug ||
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

export function summarizeTags(articles: Article[], limit = 30) {
  const tagCount = new Map<string, number>()

  articles.forEach((article) => {
    const tags = article.tags ?? []

    tags.forEach((tag) => {
      tagCount.set(tag, (tagCount.get(tag) ?? 0) + 1)
    })
  })

  return [...tagCount.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([label, count]) => ({ label, count }))
}
// 对文章分类进行汇总统计
export function summarizeCategories(articles: Article[]) {
  const categoryCount = new Map<string, CategorySummaryItem>()

  articles.forEach((article) => {
    const currentEntry = categoryCount.get(article.categorySlug)

    if (currentEntry) {
      currentEntry.count += 1
      return
    }

    categoryCount.set(article.categorySlug, {
      label: article.category,
      slug: article.categorySlug,
      count: 1
    })
  })
// 合并配置分类和额外分类
  const configuredItems = categoryOptions
    .map((item) => categoryCount.get(item.slug))
    .filter((item): item is CategorySummaryItem => Boolean(item))

  const configuredSlugs = new Set(configuredItems.map((item) => item.slug))
  const extraItems = [...categoryCount.values()].filter((item) => !configuredSlugs.has(item.slug))

  return [...configuredItems, ...extraItems]
}
