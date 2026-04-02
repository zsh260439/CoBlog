export * from './article'
export * from './markdown'
export * from './narrative'
export * from './site'

export interface ApiResponse<T> {
  data: T | null
  message: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}
