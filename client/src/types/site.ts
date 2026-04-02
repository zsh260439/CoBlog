export interface SiteNavItem {
  label: string
  path: string
  routeNames: string[]
}

export interface SiteCategory {
  label: string
  slug: string
}

export interface SiteSection {
  title: string
  paragraphs: string[]
}

export interface SiteLink {
  label: string
  description: string
}
