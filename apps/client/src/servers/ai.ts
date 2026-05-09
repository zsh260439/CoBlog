import { requestWithOptions } from '@/http-utils'
import { API_BASE_URL } from '@/config/http'
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

export const streamChatWithArticleAi = async (
  payload: ArticleAiChatPayload,
  onChunk: (chunk: string) => void,
) => {
  const token = localStorage.getItem('local-token')
  const response = await fetch(`${API_BASE_URL}/ai/article/chat/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(await response.text())
  }

  const reader = response.body!.pipeThrough(new TextDecoderStream()).getReader()

  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    onChunk(value)
  }
}
