import { request } from '@/http-utils'
import type { GuestbookEntry } from '@/types'

export interface CreateMessagePayload {
  author: string
  content: string
  email?: string
  qq?: string
  location?: string
  device?: string
  browser?: string
  isPrivate?: boolean
  enableEmailNotice?: boolean
  useMarkdown?: boolean
}
// 获取留言列表
export const getMessageList = () => {
  return request<GuestbookEntry[]>('/messages', 'GET')
}
// 创建留言
export const createMessage = (data: CreateMessagePayload) => {
  return request<GuestbookEntry>('/messages', 'POST', data)
}
