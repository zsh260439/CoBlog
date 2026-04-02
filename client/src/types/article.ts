export interface Article {
  _id: string
  slug: string
  title: string
  content: string
  excerpt: string
  summary: string
  category: string
  categorySlug: string
  tags: string[]
  coverImage?: string
  createdAt: string
  updatedAt: string
  views: number
  comments: number
  likes: number
  wordCount: number
}

export interface ArticleFormData {
  slug?: string
  title: string
  content: string
  excerpt: string
  summary?: string
  category: string
  categorySlug?: string
  tags: string[]
  coverImage?: string
}
