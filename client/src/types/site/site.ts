// 顶部导航项结构
export interface SiteNavItem {
  label: string // 导航显示文本
  path: string // 导航跳转路径
  routeNames: string[] // 视为当前导航激活的路由名数组
}

// 站点分类结构
export interface SiteCategory {
  label: string // 分类名称
  slug: string // 分类路由别名
}

// 站点内容分区结构
export interface SiteSection {
  title: string // 页面分组标题
  paragraphs: string[] // 分组下的正文段落数组
}

// 站点链接结构
export interface SiteLink {
  label: string // 链接名称
  description: string // 链接说明文字
}
