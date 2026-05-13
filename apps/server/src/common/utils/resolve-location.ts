import axios from 'axios'
import { normalizeLocation } from './normalize-location'

export async function resolveLocation(ip: string) {
  const normalized = ip.replace('::ffff:', '').trim()
  if (!normalized || normalized === '::1' || normalized === '127.0.0.1') {
    return ''
  }

  try {
    const { data } = await axios.get('https://uapis.cn/api/v1/network/ipinfo', {
      timeout: 3000,
      params: {
        ip: normalized,
        source: 'commercial',
      },
    })

    const district = typeof data.district === 'string' ? normalizeLocation(data.district) : ''
    const base = typeof data.region === 'string' ? normalizeLocation(data.region) : ''
    return normalizeLocation([base, district].filter(Boolean).join(' '))
  } catch {
    return ''
  }
}
