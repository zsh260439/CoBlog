import { requestWithOptions } from '@/http-utils'
import { API_BASE_URL } from '@/config/http'
import type {
  ArticleAiChatPayload,
  ArticleAiChatResult,
  ArticleAiStreamSessionResult,
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
  const sessionResult = await requestWithOptions<ArticleAiStreamSessionResult>(
    '/ai/article/chat/stream-session',
    'POST',
    payload,
    { timeout: 120000 },
  )
  const sessionId = sessionResult.data.sessionId

  await new Promise<void>((resolve, reject) => {
    const eventSource = new EventSource(`${API_BASE_URL}/ai/article/chat/stream/${sessionId}`, {
      withCredentials: true,
    })
    let streamFinished = false

    eventSource.addEventListener('chunk', (event) => {
      onChunk(event.data)
    })

    eventSource.addEventListener('done', () => {
      streamFinished = true
      eventSource.close()
      resolve()
    })

    eventSource.addEventListener('stream_error', (event) => {
      streamFinished = true
      eventSource.close()
      const message = event instanceof MessageEvent && event.data ? String(event.data) : 'AI stream failed'
      reject(new Error(message))
    })

    eventSource.onerror = () => {
      if (streamFinished) {
        return
      }

      console.warn('AI SSE connection interrupted; EventSource will retry')
    }
  })
}
