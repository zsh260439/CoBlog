const MAINLAND_PREFIXES = [
  '北京',
  '天津',
  '上海',
  '重庆',
  '河北',
  '山西',
  '辽宁',
  '吉林',
  '黑龙江',
  '江苏',
  '浙江',
  '安徽',
  '福建',
  '江西',
  '山东',
  '河南',
  '湖北',
  '湖南',
  '广东',
  '海南',
  '四川',
  '贵州',
  '云南',
  '陕西',
  '甘肃',
  '青海',
  '内蒙古',
  '广西',
  '西藏',
  '宁夏',
  '新疆',
]

export function normalizeLocation(value: string) {
  const normalized = value.trim()

  if (!normalized) {
    return ''
  }

  const withoutCountry = normalized.replace(/^中国\s+/, '').trim()
  const segments = withoutCountry.replace(/\s+/g, ' ').split(' ').filter(Boolean)

  return segments.slice(0, 2).join(' ')
}

export function isMainlandLocation(value: string) {
  const normalized = normalizeLocation(value)
  if (!normalized) {
    return false
  }

  return MAINLAND_PREFIXES.some((prefix) => normalized.startsWith(prefix))
}
