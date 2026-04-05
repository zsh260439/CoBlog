export * from './article'
export * from './markdown'
export * from './mock'
export * from './narrative'
export * from './site'
export * from './ui'

export interface ApiResponse<T> {
  data: T | null // 接口返回的数据主体
  message: string // 接口消息说明
  success: boolean // 接口是否成功
}

export interface PaginatedResponse<T> {
  data: T[] // 当前页数据
  total: number // 总记录数
  page: number // 当前页码
  pageSize: number // 每页条数
}
