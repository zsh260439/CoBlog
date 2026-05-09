// 博客文章完整结构
export interface Article {
  _id: string // 文章唯一标识
  slug: string // 文章路由别名
  title: string // 文章标题
  content: string // 文章正文内容
  excerpt: string // 文章摘要
  category: string // 分类中文名称
  categorySlug: string // 分类路由别名
  tags: string[] // 文章标签数组
  coverImage?: string // 封面图地址，可选
  createdAt: string // 创建时间
  views: number // 浏览量
  wordCount: number // 字数统计
  previous?:{slug:string;title:string} |null
  next?:{slug:string,title:string} |null
  related?:Article[]
}
