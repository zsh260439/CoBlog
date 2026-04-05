import type { Article } from './article'
import type { MarkdownHeading } from './markdown'
import type { NarrativeSection } from './narrative'

// 首页粒子背景动画中单个粒子的结构
export interface Particle {
  x: number // 粒子横坐标
  y: number // 粒子纵坐标
  vx: number // 横向速度
  vy: number // 纵向速度
  size: number // 粒子大小
  opacity: number // 粒子透明度
}

// Markdown 渲染组件接收的内容参数
export interface MarkdownViewerProps {
  content: string // Markdown 原始内容
}

// 首页滚动叙事组件的分区数据输入
export interface ScrollNarrativeProps {
  sections: NarrativeSection[] // 滚动叙事分区数组
}

// 通用顶部横幅组件的参数定义
export interface PageHeroProps {
  eyebrow?: string // 横幅顶部的小标题，可选
  title: string // 横幅主标题
  description?: string // 横幅说明文字，可选
  image?: string // 横幅背景图地址，可选
  align?: 'left' | 'center' // 横幅内容对齐方式
  height?: 'medium' | 'large' // 横幅高度规格
  mistHeight?: number // 底部白雾过渡高度，可选
}

// 文章卡片组件的参数定义
export interface PostCardProps {
  post: Article // 卡片对应的文章数据
  featured?: boolean // 是否重点展示
}

// 文章详情页顶部 Hero 组件的参数定义
export interface ArticleHeroProps {
  post: Article // 当前文章数据
  stats: string[] // 文章顶部展示的统计信息数组
}

// 文章目录组件的参数定义
export interface PostTocProps {
  items: MarkdownHeading[] // 目录项数组
  activeId?: string // 当前激活的标题 ID，可选
}

// 博客列表项组件的参数定义
export interface BlogListItemProps {
  post: Article // 列表项对应的文章数据
}

// 右侧个人信息卡片的参数定义
export interface ProfileSidebarCardProps {
  posts: Article[] // 当前页面可用文章数组
  ownerName: string // 站点所有者名称
  ownerRole: string // 站点所有者角色
  ownerLocation: string // 站点所有者所在地
  imageUrl?: string // 头像图片地址，可选
  actionLabels?: string[] // 底部操作按钮文字数组，可选
}

// 站点统计卡片中单项统计数据的结构
export interface StatItem {
  label: string // 统计项名称
  value: string // 统计项值
}

// 站点统计卡片组件的参数定义
export interface SiteStatsCardProps {
  items?: StatItem[] // 站点统计项数组，可选；不传时使用默认站点统计
}

// 留言板页面中单条留言的结构
export interface GuestbookEntry {
  id: string // 留言唯一标识
  author: string // 留言者昵称
  location: string // 留言者位置
  device: string // 留言设备
  browser: string // 留言浏览器
  content: string // 留言正文
  createdAt: string // 留言创建时间
}
