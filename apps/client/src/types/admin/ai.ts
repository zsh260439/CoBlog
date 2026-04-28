export interface OptimizeArticlePayload {
  title?: string
  content: string
  instruction?: string
}

export interface AiChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ArticleAiChatPayload {
  title?: string
  content?: string
  instruction?: string
  messages: AiChatMessage[]
}

export interface OptimizeArticleResult {
  content: string
}

export interface ArticleAiChatResult {
  content: string
}

export interface GenerateSummaryPayload {
  title?: string
  content: string
  instruction?: string
  excerptLength?: number
}

export interface GenerateSummaryResult {
  excerpt: string
  summary: string
}
