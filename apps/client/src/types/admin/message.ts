export interface AdminMessageItem {
  id: string
  author: string
  authorType?: 'visitor' | 'admin'
  content: string
  email?: string
  qq?: string
  senderId: string
  ip: string
  parentId?: string
  rootId?: string
  replyToAuthor?: string
  location: string
  device: string
  browser: string
  enableEmailNotice: boolean
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  updatedAt: string
  reviewedAt?: string
}
