// 请求提交数据结构，可以是普通对象或表单数据
export type SubmitData = object | FormData

// 通用接口响应结构
export interface ApiResponse<T> {
  code: number // 接口状态码
  data: T | null // 接口返回的数据主体
  message: string // 接口消息说明
}

// Axios 请求层使用的接口响应结构
export type ApiResult<T> = ApiResponse<T>

// 分页接口响应结构
export interface PaginatedResponse<T> {
  data: T[] // 当前页数据数组
  total: number // 总记录数
  page: number // 当前页码
  pageSize: number // 每页条数
}
