export function formatDate(date: string | Date, format: 'long' | 'iso' = 'long'): string {
  const d = typeof date === 'string' ? new Date(date) : date

  if (format === 'iso') {
    return d.toISOString()
  }

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  const day = d.getDate()
  const month = months[d.getMonth()]
  const year = d.getFullYear()

  return `${month} ${day}, ${year}`
}
