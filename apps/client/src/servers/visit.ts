import { request } from '@/http-utils'
import type { VisitStatsPayload } from '@/types/visit'

export const trackVisit = (path: string, senderId: string, location?: string) => {
  return request<{ ok: boolean; counted: boolean }>('/visits/track', 'POST', {
    path,
    senderId,
    ...(location ? { location } : {}),
  })
}

export const getVisitStats = () => {
  return request<VisitStatsPayload>('/visits/stats', 'GET')
}
