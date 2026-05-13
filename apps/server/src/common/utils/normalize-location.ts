export function normalizeLocation(value: string) {
  const normalized = value.trim()

  if (!normalized) {
    return ''
  }

  const withoutCountry = normalized.replace(/^中国\s+/, '').trim()
  const segments = withoutCountry.replace(/\s+/g, ' ').split(' ').filter(Boolean)

  return segments.slice(0, 2).join(' ')
}
