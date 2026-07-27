import { BadGatewayException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { randomUUID } from 'crypto'
import { Observable, Subject } from 'rxjs'
import { ArticleChatDto } from './dto/article-chat.dto'
import { GenerateExcerptDto } from './dto/generate-excerpt.dto'
import { OptimizeArticleDto } from './dto/optimize-article.dto'
import { DeepSeekMessage, DeepSeekOptions, DeepSeekResponse } from './types/deepseek.types'

interface ArticleStreamSession {
  userId: string
  dto: ArticleChatDto
  expiresAt: number
  events: ArticleStreamEvent[]
  nextEventId: number
  started: boolean
  completed: boolean
  stream$: Subject<ArticleStreamEvent>
}

interface ArticleStreamEvent {
  id: string
  type: 'chunk' | 'ping' | 'done' | 'stream_error'
  data: string
  retry?: number
}

@Injectable()
export class AiService {
  private readonly streamSessions = new Map<string, ArticleStreamSession>()
  private readonly streamSessionTtlMs = 2 * 60 * 1000

  constructor(private readonly configService: ConfigService) {}

  private get apiKey() {
    return this.configService.get<string>('DEEPSEEK_API_KEY')?.trim() || ''
  }

  private get apiUrl() {
    return this.configService.get<string>('DEEPSEEK_API_URL')?.trim() || 'https://api.deepseek.com/chat/completions'
  }

  private get model() {
    return this.configService.get<string>('DEEPSEEK_MODEL')?.trim() || 'deepseek-v4-flash'
  }

  private ensureConfigured() {
    if (!this.apiKey) {
      throw new InternalServerErrorException('DEEPSEEK_API_KEY is not configured')
    }
  }

  private extractMessageContent(payload: DeepSeekResponse) {
    const rawContent = payload.choices?.[0]?.message?.content

    if (typeof rawContent === 'string') {
      return rawContent.trim()
    }

    if (Array.isArray(rawContent)) {
      return rawContent
        .map((item) => {
          if (typeof item === 'string') {
            return item
          }

          if (item && typeof item === 'object' && 'text' in item && typeof item.text === 'string') {
            return item.text
          }

          return ''
        })
        .join('')
        .trim()
    }

    return ''
  }

  private async requestDeepSeek(
    messages: DeepSeekMessage[],
    model: string = this.model,
    options: DeepSeekOptions = {},
  ) {
    this.ensureConfigured()
    const {
      thinking = { type: 'disabled' },
      max_tokens,
      response_format = { type: 'text' },
      stop,
      stream = false,
      stream_options,
      temperature = 0.24,
      top_p,
      user_id,
    } = options

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        messages,
        model,
        stream,
        temperature,
        thinking,
        response_format,
        ...(top_p !== undefined && { top_p }),
        ...(max_tokens !== undefined && { max_tokens }),
        ...(stop && { stop }),
        ...(stream_options && { stream_options }),
        ...(user_id && { user_id }),
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new BadGatewayException(`DeepSeek request failed: ${errorText.slice(0, 200)}`)
    }

    const payload = (await response.json()) as DeepSeekResponse
    const content = this.extractMessageContent(payload)

    if (!content) {
      throw new BadGatewayException('DeepSeek did not return valid content')
    }

    return content
  }

  async optimizeArticle(dto: OptimizeArticleDto) {
    const systemPrompt = [
      '你是一个技术博客 Markdown 编辑助手。',
      '你的任务是优化文章表达和 Markdown 格式，但不能编造事实。',
      '保留原有标题层级、代码块、列表、引用、链接和技术结论。',
      '如果内容明显口语化，可以润色成更自然的技术博客表达。',
      '最终只输出优化后的 Markdown 正文，不要解释。',
    ].join('\n')

    const userPrompt = [
      dto.title ? `文章标题：${dto.title}` : '',
      dto.instruction ? `额外要求：${dto.instruction}` : '',
      '请基于下面的 Markdown 正文进行优化：',
      dto.content,
    ]
      .filter(Boolean)
      .join('\n\n')

    const content = await this.requestDeepSeek(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      this.model,
      { temperature: 0.24 },
    )

    return { content }
  }

  async generateExcerpt(dto: GenerateExcerptDto) {
    const excerptLength = dto.excerptLength ?? 120
    const systemPrompt = [
      '你是一个技术博客摘要助手。',
      `直接返回摘要文本，控制在 ${excerptLength} 字以内。`,
      '不要输出 JSON，不要加引号，不要加标题或其他额外格式。',
    ].join('\n')

    const userPrompt = [
      dto.title ? `文章标题：${dto.title}` : '',
      dto.instruction ? `额外要求：${dto.instruction}` : '',
      '请为下面的 Markdown 正文生成摘要：',
      dto.content,
    ]
      .filter(Boolean)
      .join('\n\n')

    const content = await this.requestDeepSeek(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      this.model,
      { temperature: 0.24 },
    )

    const excerpt = content.replace(/^[`'"]+|[`'"]+$/g, '').trim()
    if (!excerpt) {
      throw new BadGatewayException('DeepSeek returned an invalid excerpt')
    }

    return { excerpt }
  }

  async chatArticleAssistant(dto: ArticleChatDto) {
    const messages = this.buildArticleAssistantMessages(dto)
    const content = await this.requestDeepSeek(messages, this.model, { temperature: 0.24 })
    return { content }
  }

  createArticleStreamSession(userId: string, dto: ArticleChatDto) {
    this.cleanupExpiredStreamSessions()

    const sessionId = randomUUID()
    this.streamSessions.set(sessionId, {
      userId,
      dto,
      expiresAt: Date.now() + this.streamSessionTtlMs,
      events: [],
      nextEventId: 0,
      started: false,
      completed: false,
      stream$: new Subject<ArticleStreamEvent>(),
    })

    return { sessionId }
  }

  consumeArticleStreamSession(sessionId: string, userId: string) {
    const session = this.streamSessions.get(sessionId)
    if (!session || session.expiresAt < Date.now() || session.userId !== userId) {
      throw new NotFoundException('AI stream session not found')
    }

    return session.dto
  }

  streamArticleSession(
    sessionId: string,
    userId: string,
    lastEventId?: string,
  ): Observable<ArticleStreamEvent> {
    const session = this.streamSessions.get(sessionId)

    if (!session || session.expiresAt < Date.now() || session.userId !== userId) {
      throw new NotFoundException('AI stream session not found')
    }

    const lastId = lastEventId ? Number(lastEventId) : 0
    const replayEvents = Number.isFinite(lastId)
      ? session.events.filter((event) => Number(event.id) > lastId)
      : session.events

    if (session.completed) {
      return new Observable<ArticleStreamEvent>((subscriber) => {
        replayEvents.forEach((event) => subscriber.next(event))
        // 已完成的会话只做事件回放，不主动 complete。
        // EventSource 看到服务端关闭会按规范自动重连，导致已完成任务反复请求旧 session。
      })
    }

    return new Observable<ArticleStreamEvent>((subscriber) => {
      const subscription = session.stream$.subscribe(subscriber)

      for (const event of replayEvents) {
        subscriber.next(event)
      }

      if (!session.started) {
        session.started = true
        void this.runArticleStreamSession(session)
      }

      return () => subscription.unsubscribe()
    })
  }

  private async streamArticleAssistant(dto: ArticleChatDto, onChunk: (chunk: string) => void) {
    const messages = this.buildArticleAssistantMessages(dto)
    this.ensureConfigured()

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        messages,
        model: this.model,
        stream: true,
        temperature: 0.24,
        thinking: { type: 'disabled' },
        response_format: { type: 'text' },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new BadGatewayException(`DeepSeek request failed: ${errorText.slice(0, 200)}`)
    }

    const reader = response.body!.pipeThrough(new TextDecoderStream()).getReader()
    let buffer = ''

    while (true) {
      const { value, done } = await reader.read()
      if (done) break

      buffer += value
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue

        const payload = line.slice(6).trim()
        if (payload === '[DONE]') return

        const json = JSON.parse(payload)
        const content = json.choices?.[0]?.delta?.content || ''
        if (content) {
          onChunk(content)
        }
      }
    }
  }

  private async runArticleStreamSession(session: ArticleStreamSession) {
    const heartbeat = setInterval(() => {
      if (!session.completed) {
        this.publishArticleStreamEvent(session, 'ping', 'alive')
      }
    }, 20000)

    try {
      await this.streamArticleAssistant(session.dto, (chunk) => {
        this.publishArticleStreamEvent(session, 'chunk', chunk)
      })
      this.publishArticleStreamEvent(session, 'done', '[DONE]')
    } catch (error: unknown) {
      this.publishArticleStreamEvent(
        session,
        'stream_error',
        error instanceof Error ? error.message : 'AI stream failed',
      )
    } finally {
      session.completed = true
      clearInterval(heartbeat)
      setTimeout(() => {
        this.streamSessions.delete(
          [...this.streamSessions.entries()].find(([, item]) => item === session)?.[0] || '',
        )
      }, this.streamSessionTtlMs)
    }
  }

  private publishArticleStreamEvent(
    session: ArticleStreamSession,
    type: ArticleStreamEvent['type'],
    data: string,
  ) {
    const event: ArticleStreamEvent = {
      id: String(++session.nextEventId),
      type,
      data,
      retry: 3000,
    }

    session.events.push(event)
    session.stream$.next(event)
  }

  private cleanupExpiredStreamSessions() {
    const now = Date.now()
    for (const [sessionId, session] of this.streamSessions.entries()) {
      if (session.expiresAt < now) {
        this.streamSessions.delete(sessionId)
      }
    }
  }

  private buildArticleAssistantMessages(dto: ArticleChatDto): DeepSeekMessage[] {
    const systemPrompt = [
      '你是一个技术博客写作工作台，不是闲聊助手。',
      '你要围绕当前文章完成标题、摘要、润色、Markdown 结构优化、续写和标签建议等写作任务。',
      '优先输出可以直接应用到文章编辑器里的内容。',
      '如果用户要求生成正文，请直接给出 Markdown 内容。',
      '不能编造不存在的 API、结论或代码行为。',
    ].join('\n')

    const contextPrompt = [
      dto.title ? `当前文章标题：${dto.title}` : '',
      dto.instruction ? `全局写作要求：${dto.instruction}` : '',
      dto.content?.trim() ? `当前正文草稿：\n${dto.content}` : '当前正文草稿为空。',
    ]
      .filter(Boolean)
      .join('\n\n')

    return [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: contextPrompt },
      ...dto.messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    ]
  }
}
