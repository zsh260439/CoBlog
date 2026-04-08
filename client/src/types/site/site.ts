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
