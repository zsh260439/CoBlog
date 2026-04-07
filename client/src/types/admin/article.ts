// 后台文章编辑表单结构
export interface AdminArticleForm {
  title: string // 后台编辑器里的文章标题
  slug: string // 后台编辑器里的文章路径别名
  excerpt: string // 后台编辑器里的文章摘要
  summary: string // 后台编辑器里的文章总结
  category: string // 后台编辑器里的分类名称
  categorySlug: string // 后台编辑器里的分类别名
  tags: string[] // 后台编辑器里的标签数组
  coverImage: string // 后台编辑器里的封面图地址
  content: string // 后台编辑器里的 Markdown 正文
}

// 后台文章草稿结构
export interface ArticleDraftState {
  title: string // 草稿中的文章标题
  slug: string // 草稿中的文章路径别名
  excerpt: string // 草稿中的文章摘要
  summary: string // 草稿中的文章总结
  category: string // 草稿中的分类名称
  categorySlug: string // 草稿中的分类别名
  tags: string[] // 草稿中的标签数组
  coverImage: string // 草稿中的封面图地址
  content: string // 草稿中的 Markdown 正文
  draftMode: boolean // 当前草稿是否处于草稿模式
}

// 后台草稿仓库状态结构
export interface AdminStoreState {
  articleDraft: ArticleDraftState | null // 当前缓存的文章草稿
}
