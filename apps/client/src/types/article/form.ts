// 文章表单提交数据
export interface ArticleFormData {
  slug: string // 表单里的文章别名
  title: string // 表单提交的标题
  content: string // 表单提交的正文
  excerpt: string // 表单提交的摘要
  category: string // 表单里的分类名称
  categorySlug: string // 表单里的分类别名
  tags: string[] // 表单里的标签数组
  coverImage: string // 表单里的封面图地址
}
