import axios from 'axios'
import type { AxiosInstance, Method } from 'axios'
import type { ApiResult, SubmitData } from '@/types/http'
import { API_BASE_URL } from '@/config/http'
import {refreshAccessToken} from '@/servers/auth'
// 创建 axios 实例
const httpInstance = axios.create({
  baseURL: `${API_BASE_URL}/`,
  timeout: 10000,
  //允许前端携带cookie
  withCredentials:true
})

// 请求拦截器
httpInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('local-token')
    if(token){
      //如果有token 就添加到请求头
       config.headers = config.headers || {}
       config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器
 //刷新锁 标记是否正在刷新token 防止多个401重复调用接口
  let isRefreshing  =  false
  //请求队列 存储正在请求刷新的失败接口 等token获得后统一处理
  let requestQueue:Array<(token:string)=> void > = []
httpInstance.interceptors.response.use(
  //正常请求不用管
  (res)=>res.data,
  //失败回调可能有登录401的问题
 async (error)=>{
    //首先拿到一个或者多个失败的那个原始请求
    const originalRequest = error.config
    //只处理401错误
    if(originalRequest?.response.status === 401 && !originalRequest._retry) {
       //场景1:正在刷新token 加入请求队列
       if(isRefreshing) {
        //把这个请求推入队列
         return new Promise((resolve)=>{
            requestQueue.push((token:string)=>{
              //内部是函数逻辑
              //给这个请求设置新token
               originalRequest.headers.Authorization = `Bearer ${token}`
               //重新发请求
               resolve(httpInstance(originalRequest))
            })
         })
       }


      //场景2:第一次401 开始刷新token 防止上面的无限循环
      originalRequest._retry = true
      //上锁 表示正在请求
      isRefreshing = true
      try {
        //调用刷新接口
        const result = await refreshAccessToken()
        //调用成功了会从后端返回accesstoken
        const newToken = result.data?.accessToken
        //如果没有 抛出错误
        if(!newToken) throw new Error('刷新token失败!')
        //否则把新的token插入localstorage
        localStorage.setItem('local-token',newToken)
        //刷新成功 处理并清空队列
        requestQueue.forEach((callback)=>callback(newToken))
        requestQueue = []
        //给最开始的失败的请求设置新token
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        //重发当前失败的请求
        return httpInstance(originalRequest)
      } 
      //refreshToken也过期了
      catch(refreshError){
          localStorage.removeItem('local-token')
          window.location.href = '/login'
          return Promise.reject(refreshError)
      } finally {
        //解锁状态
         isRefreshing = false
      }
    }
    return Promise.reject(error)
 }
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
