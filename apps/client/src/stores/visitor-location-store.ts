import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getVisitorLocation } from '@/servers/visit'

const VISITOR_LOCATION_KEY = 'visitor:location'
const VISITOR_LOCATION_CACHE_MS = 30 * 60 * 1000

function loadVisitorLocation() {
  const raw = localStorage.getItem(VISITOR_LOCATION_KEY)
  if (!raw) {
    return null
  }

  return JSON.parse(raw) as { location: string; expiresAt: number }
}

export const useVisitorLocationStore = defineStore('visitor-location', () => {
  const cached = loadVisitorLocation()
  const location = ref(cached ? cached.location : '')
  const expiresAt = ref(cached ? cached.expiresAt : 0)
  const loading = ref<Promise<string> | null>(null)

  const ensureLocation = async (force = false) => {
    if (!force && location.value && expiresAt.value > Date.now()) {
      return location.value
    }

    if (loading.value) {
      return loading.value
    }

    loading.value = (async () => {
      try {
        const result = await getVisitorLocation()
        const nextLocation = result.data.location.trim()
        const nextExpiresAt = Date.now() + VISITOR_LOCATION_CACHE_MS

        location.value = nextLocation
        expiresAt.value = nextExpiresAt
        localStorage.setItem(VISITOR_LOCATION_KEY, JSON.stringify({
          location: nextLocation,
          expiresAt: nextExpiresAt,
        }))
        return nextLocation
      } finally {
        loading.value = null
      }
    })()

    return loading.value
  }

  return {
    location,
    expiresAt,
    loading,
    ensureLocation,
  }
})
