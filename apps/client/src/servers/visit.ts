import { request } from '@/http-utils'
import type { VisitStatsPayload } from '@/types/visit'

export const trackVisit = (path: string) => {
  return request<{ ok: boolean }>('/visits/track', 'POST', { path })
}

export const getVisitStats = () => {
  return request<VisitStatsPayload>('/visits/stats', 'GET')
}
