import { ref } from 'vue'
import { getVisitStats } from '@/servers/visit'
import type { VisitCityItem, VisitStatsPayload, VisitSummary, VisitTrendItem } from '@/types/visit'

const summary = ref<VisitSummary | null>(null)
const trend = ref<VisitTrendItem[]>([])
const cities = ref<VisitCityItem[]>([])
const isLoading = ref(false)
let loadingPromise: Promise<void> | null = null

export function useVisitStats() {
  const loadVisitStats = async (force = false) => {
    if (!force && summary.value && trend.value.length && cities.value.length) {
      return
    }

    if (loadingPromise) {
      return loadingPromise
    }

    isLoading.value = true

    loadingPromise = (async () => {
      try {
        const result = await getVisitStats()
        const payload = result.data as VisitStatsPayload | undefined
        summary.value = payload?.summary ?? null
        trend.value = payload?.trend ?? []
        cities.value = payload?.cities ?? []
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
