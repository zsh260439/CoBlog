export interface AdminReplyNoticeJob {
  parent: {
    author?: string
    content?: string
    email?: string
    enableEmailNotice?: boolean
  }
  reply: {
    content?: string
  }
}
