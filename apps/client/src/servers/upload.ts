import { request } from '@/http-utils'
import type { UploadImageResult } from '@/types/upload'

// 上传单个图片文件到后端上传接口
export const uploadImage = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request<UploadImageResult>('/uploads/image', 'POST', formData)
}
