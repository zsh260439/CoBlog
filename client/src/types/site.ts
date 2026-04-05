export interface SiteNavItem {
  label: string // 导航显示文本
  path: string // 导航跳转路径
  routeNames: string[] // 哪些路由名视为当前导航激活
}

export interface SiteCategory {
  label: string // 分类名称
  slug: string // 分类路由别名
}

export interface SiteSection {
  title: string // 页面分组标题
  paragraphs: string[] // 分组下的正文段落数组
}

export interface SiteLink {
  label: string // 链接名称
  description: string // 链接说明文字
}
