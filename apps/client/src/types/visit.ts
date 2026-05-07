export interface VisitSummary {
  onlineUsers: number
  todayViews: number
  totalViews: number
  totalVisitors: number
}

export interface VisitTrendItem {
  label: string
  value: number
}

export interface VisitCityItem {
  label: string
  value: number
}

export interface VisitStatsPayload {
  summary: VisitSummary
  trend: VisitTrendItem[]
  cities: VisitCityItem[]
}
