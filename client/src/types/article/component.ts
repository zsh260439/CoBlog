import type { MarkdownHeading } from '../content'
import type { Article } from './article'

// 文章卡片组件参数
export interface ArticleCardProps {
  article: Article // 卡片对应的文章数据
  featured?: boolean // 是否重点展示，可选
}

// 文章详情 Hero 组件参数
export interface ArticleHeroProps {
  article: Article // 当前文章数据
  stats: string[] // 顶部展示的统计文本数组
}

// 文章目录组件参数
export interface ArticleTocProps {
  items: MarkdownHeading[] // 目录标题数组
  activeId?: string // 当前高亮标题 ID，可选
}

// 博客列表项组件参数
export interface BlogListItemProps {
  article: Article // 列表项对应的文章数据
}
