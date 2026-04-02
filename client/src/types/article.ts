export interface Article {
  _id: string
  title: string
  content: string
  excerpt: string
  category: string
  tags: string[]
  coverImage?: string
  createdAt: string
  updatedAt: string
}

export interface ArticleFormData {
  title: string
  content: string
  excerpt: string
  category: string
  tags: string[]
  coverImage?: string
}
