import axios from 'axios'
import type { AxiosInstance, Method } from 'axios'

// 创建 axios 实例
const httpInstance = axios.create({
  baseURL: 'http://localhost:3000/',
  timeout: 10000
})

// 请求提交数据类型
type SubmitData = object | FormData

// 后端统一响应结构
export type ApiResult<T> = {
  code: number
  message: string
  data: T
}

// 请求拦截器
httpInstance.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
)

// 响应拦截器
httpInstance.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
)

// 统一 request 封装
const baseRequest = <T>(
  http: AxiosInstance,
  url: string,
  method: Method = 'GET',
  submitData?: SubmitData,
) => {
  return http.request<any, ApiResult<T>>({
    url,
    method,
    [method.toUpperCase() === 'GET' ? 'params' : 'data']: submitData,
  })
}

export const request = <T>(url: string, method: Method = 'GET', submitData?: SubmitData) => {
  return baseRequest<T>(httpInstance, url, method, submitData)
}

export default httpInstance
