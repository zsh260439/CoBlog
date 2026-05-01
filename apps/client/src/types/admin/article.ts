// 后台文章编辑表单结构
export interface AdminArticleForm {
  title: string
  slug: string
  excerpt: string
  category: string
  categorySlug: string
  tags: string[]
  coverImage: string
  content: string
}

// 后台文章草稿结构
export interface ArticleDraftState {
  title: string
  slug: string
  excerpt: string
  category: string
  categorySlug: string
  tags: string[]
  coverImage: string
  content: string
}
