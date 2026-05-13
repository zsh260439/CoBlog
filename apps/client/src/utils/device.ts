export function isMobileDeviceLabel(device?: string) {
  const normalized = (device || '').trim().toLowerCase()

  if (!normalized) {
    return false
  }

  return normalized.includes('android')
    || normalized.includes('ios')
    || normalized.includes('iphone')
    || normalized.includes('ipad')
    || normalized.includes('mobile')
    || normalized.includes('phone')
}
