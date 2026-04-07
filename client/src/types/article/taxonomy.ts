// 文章分类结构
export interface ArticleCategory {
  _id: string // 分类唯一标识
  label: string // 分类名称
  slug: string // 分类路由别名
  count: number // 分类对应的文章数量
  createdAt: string // 分类创建时间
  updatedAt: string // 分类更新时间
}

// 文章标签结构
export interface ArticleTag {
  _id: string // 标签唯一标识
  label: string // 标签名称
  slug: string // 标签路由别名
  count: number // 标签对应的文章数量
  createdAt: string // 标签创建时间
  updatedAt: string // 标签更新时间
}

// 新增分类提交结构
export interface CreateArticleCategoryPayload {
  label: string // 提交的分类名称
  slug: string // 提交的分类别名
}

// 新增标签提交结构
export interface CreateArticleTagPayload {
  label: string // 提交的标签名称
  slug: string // 提交的标签别名
}

// 分类汇总项结构
export interface CategorySummaryItem {
  label: string // 分类显示名称
  slug: string // 分类路由别名
  count: number // 分类对应的文章数量
}
