// 留言页渲染的单条消息结构。
export interface GuestbookEntry {
  id: string
  author: string
  authorType?: 'visitor' | 'admin'
  location: string
  device: string
  browser: string
  content: string
  createdAt: string
  parentId?: string
  rootId?: string
  replyToAuthor?: string
  status?: 'pending' | 'approved' | 'rejected'
  reviewedAt?: string
  qq?: string
}

// 前台提交留言给后端时的请求体。
export interface CreateMessagePayload {
  // 前端给当前浏览器持久化一个 senderId，用来跨刷新找回"我的待审核/被拒绝"留言
  senderId: string
  author: string
  content: string
  parentId?: string
  email?: string
  qq?: string
  device?: string
  browser?: string
  enableEmailNotice?: boolean
}

export interface CreateAdminReplyPayload {
  author: string
  content: string
  device?: string
  browser?: string
}

// 留言表单本地状态。
export interface MessageFormData {
  author: string
  content: string
  email: string
  qq: string
  enableEmailNotice: boolean
}
