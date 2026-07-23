export interface MessageItem {
  id: string
  author: string
  authorType: 'visitor' | 'admin'
  location: string
  device: string
  browser: string
  content: string
  createdAt: string
  parentId: string
  rootId: string
  replyToAuthor: string
  status: 'pending' | 'approved' | 'rejected'
  reviewedAt?: string
  qq?: string
}

export interface CreateMessagePayload {
  author: string
  content: string
  parentId?: string
  email?: string
  qq?: string
  device?: string
  browser?: string
  enableEmailNotice?: boolean
  location?: string
}

export interface CreateAdminReplyPayload {
  author: string
  content: string
  device?: string
  browser?: string
  location?: string
}

export interface MessageFormData {
  author: string
  content: string
  email: string
  qq: string
  enableEmailNotice: boolean
}
