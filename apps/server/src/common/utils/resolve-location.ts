import axios from 'axios'

export async function resolveLocation(ip: string) {
  const normalized = ip.replace('::ffff:', '').trim()
  if (!normalized || normalized === '::1' || normalized === '127.0.0.1') {
    return ''
  }

  try {
    const { data } = await axios.get(`http://ip-api.com/json/${normalized}`, {
      timeout: 3000,
      params: { lang: 'zh-CN' },
    })
    if (!data || data.status !== 'success') return ''
    return [data.regionName, data.city].filter(Boolean).join(' ')
  } catch {
    return ''
  }
}
