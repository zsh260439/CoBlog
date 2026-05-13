import { ref } from 'vue'
import { getVisitStats } from '@/servers/visit'
import type { VisitCityItem, VisitStatsPayload, VisitSummary, VisitTrendItem } from '@/types/visit'

const summary = ref<VisitSummary | null>(null)
const trend = ref<VisitTrendItem[]>([])
const cities = ref<VisitCityItem[]>([])
const isLoading = ref(false)
let loadingPromise: Promise<void> | null = null
let lastLoadedAt = 0

const VISIT_STATS_CACHE_MS = 60 * 1000

export function useVisitStats() {
  const loadVisitStats = async (force = false) => {
    const isCacheFresh = Date.now() - lastLoadedAt < VISIT_STATS_CACHE_MS

    if (!force && isCacheFresh && summary.value) {
      return
    }

    if (loadingPromise) {
      return loadingPromise
    }

    isLoading.value = true

    loadingPromise = (async () => {
      try {
        const result = await getVisitStats()
        const payload: VisitStatsPayload = result.data
        summary.value = payload.summary
        trend.value = payload.trend
        cities.value = payload.cities
        lastLoadedAt = Date.now()
      } finally {
        isLoading.value = false
        loadingPromise = null
      }
    })()

    return loadingPromise
  }

  return {
    summary,
    trend,
    cities,
    isLoading,
    loadVisitStats,
  }
}
