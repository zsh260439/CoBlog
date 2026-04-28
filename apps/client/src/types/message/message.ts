// 留言板单条留言结构
export interface GuestbookEntry {
  id: string // 留言唯一标识
  author: string // 留言者昵称
  location: string // 留言者位置
  device: string // 留言设备
  browser: string // 留言浏览器
  content: string // 留言正文
  createdAt: string // 留言创建时间
}

// 留言接口提交数据结构
export interface CreateMessagePayload {
  author: string // 接口提交的留言作者
  content: string // 接口提交的留言内容
  email?: string // 接口提交的邮箱，可选
  qq?: string // 接口提交的 QQ，可选
  location?: string // 接口提交的位置，可选
  device?: string // 接口提交的设备信息，可选
  browser?: string // 接口提交的浏览器信息，可选
  isPrivate?: boolean // 是否设为私密留言，可选
  enableEmailNotice?: boolean // 是否开启邮件提醒，可选
  useMarkdown?: boolean // 是否启用 Markdown，可选
}

// 留言表单状态结构
export interface MessageFormData {
  author: string // 表单里的留言作者
  content: string // 表单里的留言内容
  email: string // 表单里的邮箱
  qq: string // 表单里的 QQ
  isPrivate: boolean // 表单里的私密状态
  enableEmailNotice: boolean // 表单里的邮件提醒开关
  useMarkdown: boolean // 表单里的 Markdown 开关
}
