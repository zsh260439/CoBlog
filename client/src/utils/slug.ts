import { pinyin } from 'pinyin-pro'

// 把中文或混合标题转成适合路由的 slug
export function createSlugFromText(value: string, maxLength = 48) {
  const source = pinyin(value, {
    toneType: 'none',
    type: 'array',
    nonZh: 'consecutive',
  }).join(' ')

  const normalized = source
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, maxLength)
    .replace(/-+$/g, '')

  return normalized || `article-${Date.now()}`
}
