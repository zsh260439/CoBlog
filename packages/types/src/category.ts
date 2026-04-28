export interface ArticleCategory {
  _id: string
  label: string
  slug: string
  count: number
  createdAt: string
  updatedAt: string
}

export interface ArticleTag {
  _id: string
  label: string
  slug: string
  count: number
  createdAt: string
  updatedAt: string
}

export interface CreateArticleCategoryPayload {
  label: string
  slug: string
}

export interface CreateArticleTagPayload {
  label: string
  slug: string
}