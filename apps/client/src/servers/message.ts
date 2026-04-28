import { request } from '@/http-utils'
import type { CreateMessagePayload, GuestbookEntry } from '@/types/message'
// 获取留言列表
export const getMessageList = () => {
  return request<GuestbookEntry[]>('/messages', 'GET')
}
// 创建留言
export const createMessage = (data: CreateMessagePayload) => {
  return request<GuestbookEntry>('/messages', 'POST', data)
}
