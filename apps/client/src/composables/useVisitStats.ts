import { ref } from 'vue'
import { getVisitStats } from '@/servers/visit'
import type { VisitCityItem, VisitStatsPayload, VisitSummary, VisitTrendItem } from '@/types/visit'

const summary = ref<VisitSummary | null>(null)
const trend = ref<VisitTrendItem[]>([])
const cities = ref<VisitCityItem[]>([])
const isLoading = ref(false)
let loaded = false

export function useVisitStats() {
  const loadVisitStats = async (force = false) => {
    if (loaded && !force) return
    isLoading.value = true
    try {
      const result = await getVisitStats()
      const payload = result.data as VisitStatsPayload | undefined
      summary.value = payload?.summary ?? null
      trend.value = payload?.trend ?? []
      cities.value = payload?.cities ?? []
      loaded = true
    } finally {
      isLoading.value = false
    }
  }

  return {
    summary,
    trend,
    cities,
    isLoading,
    loadVisitStats,
  }
}
