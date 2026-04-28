import { authRequest } from '@/http-utils'

export const refreshAccessToken = () => {
  return authRequest<{ accessToken: string }>('/auth/refresh', 'POST')
}
