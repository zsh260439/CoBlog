import { request } from '@/http-utils'
import type { LoginPayload, LoginResult } from '@/types/admin/auth'

export const login = (payload: LoginPayload) => {
  return request<LoginResult>('/auth/login', 'POST', payload)
}

export const logout = () => {
  return request<null>('/auth/logout', 'POST')
}
