import type { Article } from '../article'

// Markdown 渲染组件接收的内容参数
export interface MarkdownViewerProps {
  content: string // Markdown 原始内容
  editorId?: string // 预览实例 ID，可选
}

// 通用顶部横幅组件参数
export interface PageHeroProps {
  eyebrow?: string // 横幅顶部的小标题，可选
  title: string // 横幅主标题
  description?: string // 横幅说明文字，可选
  image?: string // 横幅背景图地址，可选
  align?: 'left' | 'center' // 横幅内容对齐方式，可选
  height?: 'medium' | 'large' // 横幅高度规格，可选
  mistHeight?: number // 底部白雾过渡高度，可选
}

// 右侧个人信息卡片参数
export interface ProfileSidebarCardProps {
  articles: Article[] // 当前页面可用文章数组
  ownerName: string // 站点所有者名称
  ownerRole: string // 站点所有者角色
  ownerLocation: string // 站点所有者所在地
  imageUrl?: string // 头像图片地址，可选
  actionLabels?: string[] // 底部操作按钮文案数组，可选
}

// 站点统计项结构
export interface StatItem {
  label: string // 统计项名称
  value: string // 统计项值
}

// 站点统计卡片参数
export interface SiteStatsCardProps {
  items?: StatItem[] // 站点统计项数组，可选
}
