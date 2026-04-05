import type { Article } from './article'

// 文章封面 mock 图生成时使用的配色结构
export interface CoverPalette {
  skyTop: string // 封面图顶部颜色
  skyBottom: string // 封面图底部颜色
  glow: string // 发光高亮颜色
  surface: string // 场景表面颜色
  silhouette: string // 场景轮廓颜色
}

// mock 文章原始种子结构，后续会补齐运行时字段生成完整 Article
export type ArticleSeed = Omit<Article, '_id' | 'updatedAt' | 'wordCount' | 'coverImage'> & {
  coverPalette: CoverPalette
}
