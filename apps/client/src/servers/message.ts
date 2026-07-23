import { request } from '@/http-utils'
import { API_BASE_URL } from '@/config/http'
import type { CreateAdminReplyPayload, CreateMessagePayload, MessageItem } from '@/types/message'
import type { AdminMessageItem } from '@/types/admin'

export const getMessageList = () => {
  return request<MessageItem[]>('/messages', 'GET')
}

export const getMyMessageList = () => {
  return request<MessageItem[]>('/messages/mine', 'GET')
}

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

export const createMessageEventSource = () => {
  return new EventSource(`${API_BASE_URL}/messages/stream`, { withCredentials: true })
}
