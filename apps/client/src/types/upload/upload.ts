// 上传图片返回结构
export interface UploadImageResult {
  _id: string // 上传记录唯一标识
  originalName: string // 原始文件名
  mimeType: string // 文件 MIME 类型
  size: number // 文件大小
  url: string // 可访问图片地址
  usage: string // 文件用途标识
  createdAt: string // 创建时间
  updatedAt: string // 更新时间
}
