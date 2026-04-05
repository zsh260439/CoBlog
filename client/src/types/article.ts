export interface Article {
  _id: string // 文章唯一标识
  slug: string // 文章路由别名
  title: string // 文章标题
  content: string // 文章正文内容
  excerpt: string // 文章摘要
  summary: string // 文章总结说明
  category: string // 分类中文名称
  categorySlug: string // 分类路由别名
  tags: string[] // 标签数组
  coverImage?: string // 封面图地址，可选
  createdAt: string // 创建时间
  updatedAt: string // 更新时间
  views: number // 浏览量
  comments: number // 评论数
  likes: number // 点赞数
  wordCount: number // 字数统计
}

export interface ArticleFormData {
  slug?: string // 表单里的文章别名，可选
  title: string // 表单提交的标题
  content: string // 表单提交的正文
  excerpt: string // 表单提交的摘要
  summary?: string // 表单提交的总结说明，可选
  category: string // 表单里的分类名称
  categorySlug?: string // 表单里的分类别名，可选
  tags: string[] // 表单里的标签数组
  coverImage?: string // 表单里的封面图地址，可选
}
