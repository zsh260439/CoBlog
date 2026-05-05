export function formatDate(date: string | Date, format: 'long' | 'iso' | 'short' = 'long'): string {
  const d = typeof date === 'string' ? new Date(date) : date

  if (format === 'iso') {
    return d.toISOString()
  }

  if (format === 'short') {
    const y = d.getFullYear()
    const M = String(d.getMonth() + 1).padStart(2, '0')
    const D = String(d.getDate()).padStart(2, '0')
    const h = String(d.getHours()).padStart(2, '0')
    const m = String(d.getMinutes()).padStart(2, '0')
    return `${y}-${M}-${D} ${h}:${m}`
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
