import type { MarkdownHeading } from '../content'
import type { Article } from './article'

// 文章顶部元信息单项结构
export interface ArticleMetaStat {
  icon: string // 对应的图标名称
  text: string // 展示文本
}

// 文章卡片组件参数
export interface ArticleCardProps {
  article: Article // 卡片对应的文章数据
}

// 文章详情 Hero 组件参数
export interface ArticleHeroProps {
  article: Article // 当前文章数据
  stats: ArticleMetaStat[] // 顶部展示的统计信息数组
}

// 文章目录组件参数
export interface ArticleTocProps {
  items: MarkdownHeading[] // 目录标题数组
  activeId?: string // 当前高亮标题 ID，可选
}
