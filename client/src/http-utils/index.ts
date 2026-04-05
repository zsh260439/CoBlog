import axios from 'axios'
import type { AxiosInstance, Method } from 'axios'
//创建axios实例
/*后台总是会返回如{
   code: 0,
   msg: 'success',
   data: []
} 的数据
*/
const httpInstance = axios.create({
    baseURL:'http://localhost:3000/',
    timeout: 10000
})
//请求拦截器
httpInstance.interceptors.request.use(
    (config) => {
        return config
    },
    (error) => Promise.reject(error)
)
//响应拦截器
httpInstance.interceptors.response.use(
    (response) => {
        return response.data
    },
    (error) => Promise.reject(error)
)
//封装成统一request
type SubmitData = object | FormData
// 定义响应数据结构
type Data<T> = {
  code: number
  message: string
  //要求：data字段必须是数组
  data: T[]
}
const baseRequest = <T>(
    http:AxiosInstance,
    url:string,
    method:Method = 'GET',
    submitData?:SubmitData,
)=>{
    return http.request<any,Data<T>>({
        url,
        method,
        [method.toUpperCase() === 'GET' ? 'params' : 'data']: submitData,
    })
}
export const request =<T>(url:string,method:Method = 'GET',submitData?:SubmitData)=>{
    return baseRequest<T>(httpInstance,url,method,submitData)
}

export default httpInstance