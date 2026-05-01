export interface Article {
  _id: string
  slug: string
  title: string
  content: string
  excerpt: string
  category: string
  categorySlug: string
  tags: string[]
  coverImage?: string
  views: number
  comments?: number
  wordCount: number
  createdAt: string
  updatedAt: string
  previous?: { slug: string; title: string } | null
  next?: { slug: string; title: string } | null
  related?: Article[]
}

export interface ArticleFormData {
  slug?: string
  title: string
  content: string
  excerpt: string
  category: string
  categorySlug?: string
  tags?: string[]
  coverImage?: string
}

export interface ArchiveGroup {
  year: string
  articles: Article[]
}