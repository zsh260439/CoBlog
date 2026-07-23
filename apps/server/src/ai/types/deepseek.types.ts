export interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface DeepSeekOptions {
  thinking?: {
    type?: 'enabled' | 'disabled'
    reasoning_effort?: 'high' | 'max'
  }
  max_tokens?: number
  response_format?: { type: 'text' | 'json_object' }
  stop?: string[]
  stream?: boolean
  stream_options?: { include_usage?: boolean }
  temperature?: number
  top_p?: number
  user_id?: string
}

export interface DeepSeekResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message?: {
      role: string
      content?: unknown
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  system_fingerprint: string
}
