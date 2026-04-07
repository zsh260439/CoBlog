import type { Article } from './article'

// 文章归档分组结构
export interface ArchiveGroup {
  year: string // 归档年份
  articles: Article[] // 当前年份下的文章数组
}
