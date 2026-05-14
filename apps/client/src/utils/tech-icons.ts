// 技术图标使用本地 SVG 文件，放在 public/icons/ 下
// 图标来源与配色保持和原 simpleicons 链接一致

const ICON_MAP: Record<string, string> = {
  javascript: 'javascript',
  typescript: 'typescript',
  vuedotjs: 'vuedotjs',
  nuxt: 'nuxt',
  nestjs: 'nestjs',
  nodedotjs: 'nodedotjs',
  vite: 'vite',
  element: 'element',
}

export function getTechIconUrl(name: string): string {
  const key = name.toLowerCase().replace(/[^a-z0-9]/g, '')
  const file = ICON_MAP[key]
  if (!file) {
    return `/icons/javascript.svg`
  }
  return `/icons/${file}.svg`
}
