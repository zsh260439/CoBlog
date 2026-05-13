export function normalizeLocation(value?: string) {
  const normalized = (value || '').trim()

  if (!normalized) {
    return ''
  }

  const withoutCountry = normalized.replace(/^中国\s+/, '').trim()
  return withoutCountry.replace(/\s+/g, ' ')
}
