import type { Request } from 'express'

const PRIVATE_IPV4_PATTERNS = [
  /^10\./,
  /^127\./,
  /^169\.254\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^192\.168\./,
]

const PRIVATE_IPV6_VALUES = new Set(['::1'])

function normalizeIp(ip: string) {
  return ip.replace(/^::ffff:/, '').trim()
}

function isPrivateIp(ip: string) {
  const normalized = normalizeIp(ip)

  if (!normalized) {
    return true
  }

  if (PRIVATE_IPV6_VALUES.has(normalized) || normalized.startsWith('fc') || normalized.startsWith('fd') || normalized.startsWith('fe80:')) {
    return true
  }

  return PRIVATE_IPV4_PATTERNS.some((pattern) => pattern.test(normalized))
}

function pickPublicIp(candidates: string[]) {
  for (const raw of candidates) {
    const normalized = normalizeIp(raw)
    if (!normalized || isPrivateIp(normalized)) {
      continue
    }

    return normalized
  }

  return ''
}

export function getClientIp(req: Request) {
  const cfConnectingIp = req.headers['cf-connecting-ip']
  const realIp = Array.isArray(cfConnectingIp) ? cfConnectingIp[0] : cfConnectingIp
  const normalizedRealIp = realIp ? normalizeIp(realIp) : ''

  if (normalizedRealIp && !isPrivateIp(normalizedRealIp)) {
    return normalizedRealIp
  }

  const forwarded = req.headers['x-forwarded-for']
  const forwardedValues = Array.isArray(forwarded)
    ? forwarded.flatMap((item) => item.split(','))
    : (forwarded || '').split(',')

  const forwardedIp = pickPublicIp(forwardedValues)
  if (forwardedIp) {
    return forwardedIp
  }

  const fallback = normalizeIp(req.ip || '')
  return isPrivateIp(fallback) ? '' : fallback
}
