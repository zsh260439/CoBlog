// 定义API响应的通用类型
export class ApiResponse<T> {
  code: number
  message: string
  data?: T

  constructor(code: number, message: string, data?: T) {
    this.code = code
    this.message = message
    this.data = data
  }

  //成功返回
  static success<T>(data: T, message: string = '操作成功', code = 200): ApiResponse<T> {
    return new ApiResponse(code, message, data)
  }

  // 错误返回统一由全局异常过滤器处理
}
