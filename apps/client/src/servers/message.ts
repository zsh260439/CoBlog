import { request } from '@/http-utils'
import { API_BASE_URL } from '@/config/http'
import type { CreateAdminReplyPayload, CreateMessagePayload, MessageItem } from '@/types/message'
import type { AdminMessageItem } from '@/types/admin'

// 公开留言：只返回已通过审核的留言
export const getMessageList = () => {
  return request<MessageItem[]>('/messages', 'GET')
}

// 当前浏览器自己的留言：返回 pending / rejected，用来跨刷新恢复状态。
export const getMyMessageList = (senderId: string) => {
  return request<MessageItem[]>(`/messages/mine/${encodeURIComponent(senderId)}`, 'GET')
}

// 创建留言
export const createMessage = (data: CreateMessagePayload) => {
  return request<MessageItem>('/messages', 'POST', data)
}

export const getAdminMessageList = () => {
  return request<AdminMessageItem[]>('/messages/admin', 'GET')
}

export const approveMessage = (id: string) => {
  return request<AdminMessageItem>(`/messages/${id}/approve`, 'PATCH')
}

export const rejectMessage = (id: string) => {
  return request<AdminMessageItem>(`/messages/${id}/reject`, 'PATCH')
}

export const deleteMessage = (id: string) => {
  return request<AdminMessageItem>(`/messages/${id}`, 'DELETE')
}

export const createAdminReply = (id: string, data: CreateAdminReplyPayload) => {
  return request<AdminMessageItem>(`/messages/${id}/admin-reply`, 'POST', data)
}

export const createMessageEventSource = (token: string) => {
  return new EventSource(`${API_BASE_URL}/messages/stream?token=${encodeURIComponent(token)}`)
}
