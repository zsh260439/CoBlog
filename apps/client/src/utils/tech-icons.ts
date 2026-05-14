// 内联 SVG 数据 URI，替代被墙的 cdn.simpleicons.org
// 每个图标是带颜色背景的小方块 + 首字母

const makeIcon = (letter: string, bg: string) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="18" fill="${bg}"/><text x="50" y="70" font-size="52" font-weight="bold" fill="white" text-anchor="middle" font-family="Arial, sans-serif">${letter}</text></svg>`)}`

export const TECH_ICONS: Record<string, string> = {
  javascript: makeIcon('JS', '#F7DF1E'),
  typescript: makeIcon('TS', '#3178C6'),
  vuedotjs: makeIcon('V', '#42B883'),
  nuxt: makeIcon('N', '#00DC82'),
  nestjs: makeIcon('Ne', '#E0234E'),
  nodedotjs: makeIcon('No', '#5FA04E'),
  vite: makeIcon('Vi', '#646CFF'),
  element: makeIcon('El', '#409EFF'),
}

export function getTechIconUrl(name: string): string {
  const key = name.toLowerCase().replace(/[^a-z0-9]/g, '')
  return TECH_ICONS[key] || TECH_ICONS.javascript
}

// 兼容原有 simpleicons URL 格式，方便渐进替换
export function resolveIconUrl(originalUrl: string): string {
  const match = originalUrl.match(/simpleicons\.org\/([^/]+)/)
  if (!match) return originalUrl
  const name = match[1].toLowerCase()
  return TECH_ICONS[name] || originalUrl
}
