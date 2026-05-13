import axios from 'axios'
import { normalizeLocation } from './normalize-location'

export async function resolveLocation(ip: string) {
  const normalized = ip.replace('::ffff:', '').trim()
  if (!normalized || normalized === '::1' || normalized === '127.0.0.1') {
    return ''
  }

  try {
    const { data } = await axios.get('https://uapis.cn/api/v1/network/myip', {
      timeout: 3000,
      headers: {
        'X-Forwarded-For': normalized,
        'X-Real-IP': normalized,
      },
      params: { source: 'commercial' },
    })

    const district = data.district.trim()
    const base = normalizeLocation(data.region)
    return normalizeLocation([base, district].filter(Boolean).join(' '))
  } catch {
    return ''
  }
}
