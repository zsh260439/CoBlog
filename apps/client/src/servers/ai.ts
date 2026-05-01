import { requestWithOptions } from '@/http-utils'
import type {
  ArticleAiChatPayload,
  ArticleAiChatResult,
  GenerateExcerptPayload,
  GenerateExcerptResult,
  OptimizeArticlePayload,
  OptimizeArticleResult,
} from '@/types/admin/ai'

export const optimizeArticleWithAi = (payload: OptimizeArticlePayload) => {
  return requestWithOptions<OptimizeArticleResult>('/ai/article/optimize', 'POST', payload, { timeout: 120000 })
}

export const generateArticleExcerptWithAi = (payload: GenerateExcerptPayload) => {
  return requestWithOptions<GenerateExcerptResult>('/ai/article/excerpt', 'POST', payload, { timeout: 120000 })
}

export const chatWithArticleAi = (payload: ArticleAiChatPayload) => {
  return requestWithOptions<ArticleAiChatResult>('/ai/article/chat', 'POST', payload, { timeout: 120000 })
}
