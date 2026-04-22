import { authRequest } from '@/http-utils'
import { request } from '@/http-utils'
import type { LoginPayload, LoginResult } from '@/types/admin/auth'

// login / logout 仍然走普通请求实例，refresh 单独走 authRequest。
export const login = (payload: LoginPayload) => {
  return request<LoginResult>('/auth/login', 'POST', payload)
}

export const refreshAccessToken = () => {
  return authRequest<{ accessToken: string }>('/auth/refresh', 'POST')
}

export const logout = () => {
  return request<null>('/auth/logout', 'POST')
}
