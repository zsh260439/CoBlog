import axios from 'axios'

const VISITOR_SENDER_ID_KEY = 'visitor:sender-id'
const VISITOR_LOCATION_KEY = 'visitor:location'
const VISITOR_LOCATION_CACHE_MS = 30 * 60 * 1000

type CachedLocation = {
  ip: string
  location: string
  expiresAt: number
}

export function getVisitorSenderId() {
  const cached = localStorage.getItem(VISITOR_SENDER_ID_KEY)
  if (cached) {
    return cached
  }

  const created = crypto.randomUUID()
  localStorage.setItem(VISITOR_SENDER_ID_KEY, created)
  return created
}

function readCachedLocation() {
  const raw = localStorage.getItem(VISITOR_LOCATION_KEY)
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as CachedLocation
    if (parsed.expiresAt > Date.now()) {
      return {
        ip: typeof parsed.ip === 'string' ? parsed.ip : '',
        location: typeof parsed.location === 'string' ? parsed.location : '',
      }
    }
  } catch {
  }

  localStorage.removeItem(VISITOR_LOCATION_KEY)
  return null
}

function writeCachedLocation(ip: string, location: string) {
  const payload: CachedLocation = {
    ip,
    location,
    expiresAt: Date.now() + VISITOR_LOCATION_CACHE_MS,
  }
  localStorage.setItem(VISITOR_LOCATION_KEY, JSON.stringify(payload))
}

export async function getClientLocation() {
  const cached = readCachedLocation()
  if (cached) {
    return cached
  }

  try {
    const { data } = await axios.get('https://uapis.cn/api/v1/network/myip', {
      timeout: 5000,
      params: { source: 'commercial' },
    })

    const region = typeof data?.region === 'string' ? data.region.trim() : ''
    const district = typeof data?.district === 'string' ? data.district.trim() : ''
    const location = [region.replace(/^中国\s+/, '').trim(), district].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim()
    const ip = typeof data?.ip === 'string' ? data.ip.trim() : ''

    writeCachedLocation(ip, location)

    return {
      ip,
      location,
    }
  } catch {
    return {
      ip: '',
      location: '',
    }
  }
}
