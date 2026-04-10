// 定义API响应的通用类型
export class ApiResponse<T> {
  code: number
  message: string
  data?: T
 
  constructor(code:number,message:string,data?:T){
    this.code=code
    this.message=message
    this.data=data
  }

  //成功返回
  static success<T>(data:T,message:string='操作成功'):ApiResponse<T>{
    return new ApiResponse(0,message,data)
  }
  // 错误返回
  static error<T>(message='操作失败',data?:T):ApiResponse<T>{
    return new ApiResponse(1,message,data)
  }
}