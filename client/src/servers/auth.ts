import {request} from '@/http-utils'
import type {LoginPayload,LoginResult} from '@/types/admin/auth'

//登录
export const login = (payload:LoginPayload) =>{
      return request<LoginResult>('/auth/login','POST',payload)
}
//刷新短令牌
export const refreshAccessToken = ()=>{
      return request<{accessToken:string}>('/auth/refresh','POST')
}
//登出
export const logout = ()=>{
       return request<null>('auth/logout','POST')
}