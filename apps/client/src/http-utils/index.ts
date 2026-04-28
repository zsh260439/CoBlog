import axios from 'axios'
import type { AxiosInstance, Method } from 'axios'
import type { ApiResult, SubmitData } from '@/types/http'
import { API_BASE_URL } from '@/config/http'
import { ElMessage } from 'element-plus'
import { refreshAccessToken } from '@/utils/auth'
interface RequestOptions {
  timeout?: number
}

// 创建 普通axios 实例
const httpInstance = axios.create({
  baseURL: `${API_BASE_URL}/`,
  timeout: 10000,
  //允许前端携带cookie
  withCredentials:true
})
//登录刷新实例
const authHttpInstance = axios.create({
  baseURL: `${API_BASE_URL}/`,
  timeout: 10000,
  //允许前端携带cookie
  withCredentials:true
})



// 统一 request 封装
const baseRequest = <T>(
  http: AxiosInstance,
  url: string,
  method: Method = 'GET',
  submitData?: SubmitData,
  options?: RequestOptions,
) => {
  return http.request<any, ApiResult<T>>({
    url,
    method,
    // 允许个别接口（例如 AI 助手）单独延长超时时间。
    timeout: options?.timeout,
    [method.toUpperCase() === 'GET' ? 'params' : 'data']: submitData,
  })
}

export const request = <T>(url: string, method: Method = 'GET', submitData?: SubmitData) => {
  return baseRequest<T>(httpInstance, url, method, submitData)
}
export const authRequest = <T>(url : string , method:Method = 'GET',submitData?:SubmitData) =>{
   return baseRequest<T>(authHttpInstance,url,method,submitData)
}

export const requestWithOptions = <T>(
  url: string,
  method: Method = 'GET',
  submitData?: SubmitData,
  options?: RequestOptions,
) => {
  return baseRequest<T>(httpInstance, url, method, submitData, options)
}


// 普通请求拦截器
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


// 普通响应拦截器
 //刷新锁 标记是否正在刷新token 防止多个401重复调用接口
  let isRefreshing  =  false
  //请求队列 存储正在请求刷新的失败接口 等token获得后统一处理
  let requestQueue:Array<(token:string)=> void > = []
  httpInstance.interceptors.response.use(
  //正常请求不用管
  (res)=>{
     // 第一层：取 axios 的 data（得到 ApiResponse）
       return res.data
       //还有第二层 这里我们都取.data来获取数据    
  },
  //失败回调可能有登录401的问题
 async (error)=>{
    const originalRequest = error.config
    const status = error.response?.status

    //只处理401错误
    if(status === 401 && originalRequest && !originalRequest._retry) {
       //场景1:正在刷新token 加入请求队列
       if(isRefreshing) {
         //把这个请求推入队列
          return new Promise((resolve)=>{
             requestQueue.push((token:string)=>{
               originalRequest.headers = originalRequest.headers || {}
               originalRequest.headers.Authorization = `Bearer ${token}`
               resolve(httpInstance(originalRequest))
             })
          })
       }


      //场景2:第一次401 开始刷新token 防止上面的无限循环
       originalRequest._retry = true
       //上锁 表示正在请求
       isRefreshing = true
       try {
         const result = await refreshAccessToken()
         const newToken = result.data?.accessToken
        //如果没有 抛出错误
        if(!newToken) throw new Error('刷新token失败!')
        localStorage.setItem('local-token',newToken)
        requestQueue.forEach((callback)=>callback(newToken))
        requestQueue = []
        originalRequest.headers = originalRequest.headers || {}
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return httpInstance(originalRequest)
      } 
      //refreshToken也过期了
      catch(refreshError){
          localStorage.removeItem('local-token')
          ElMessage.warning('登陆状态失效,请重新登录')
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
//登录响应拦截器
authHttpInstance.interceptors.response.use(
  (res) => res.data,
  (error) => Promise.reject(error)
)
