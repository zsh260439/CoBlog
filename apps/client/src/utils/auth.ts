import { authRequest } from '@/http-utils'
import type { ApiResult } from '@/types/http'

// 刷新提升为模块级单飞：路由守卫和请求拦截器共用同一个刷新 Promise，
// 避免同一页面内并发调用 /auth/refresh 触发长 token 旋转竞争
let refreshPromise: Promise<ApiResult<{ accessToken: string }>> | null = null

export const refreshAccessToken = () => {
  if (!refreshPromise) {
    refreshPromise = authRequest<{ accessToken: string }>('/auth/refresh', 'POST').finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}
