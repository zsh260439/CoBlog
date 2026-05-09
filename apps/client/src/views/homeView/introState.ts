let hasConsumedHomeIntroPlayback = false

export function consumeHomeIntroPlayback() {
  if (hasConsumedHomeIntroPlayback) return false

  hasConsumedHomeIntroPlayback = true
  return true
}
