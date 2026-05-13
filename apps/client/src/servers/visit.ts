import { request } from '@/http-utils'
import type { VisitStatsPayload } from '@/types/visit'

type VisitorLocationPayload = {
  location: string
}

export const trackVisit = (path: string, senderId: string, location?: string) => {
  return request<{ ok: boolean; counted: boolean }>('/visits/track', 'POST', {
    path,
    senderId,
    ...(location ? { location } : {}),
  })
}

export const getVisitorLocation = () => {
  return request<VisitorLocationPayload>('/visits/location', 'GET')
}

export const getVisitStats = () => {
  return request<VisitStatsPayload>('/visits/stats', 'GET')
}
