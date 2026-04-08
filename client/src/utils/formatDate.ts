export function formatDate(date: string | Date, format: 'short' | 'long' | 'iso' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date

  if (format === 'iso') {
    return d.toISOString()
  }

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const day = d.getDate()
  const month = shortMonths[d.getMonth()]
  const year = d.getFullYear()
  const fullMonth = months[d.getMonth()]

  if (format === 'long') {
    return `${fullMonth} ${day}, ${year}`
  }

  // short format: APR 01 2026
  return `${month.toUpperCase()} ${day.toString().padStart(2, '0')} ${year}`
}
