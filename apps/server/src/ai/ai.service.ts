import { BadGatewayException, Injectable, InternalServerErrorException } from '@nestjs/common'
import { ArticleChatDto } from './dto/article-chat.dto'
import { ConfigService } from '@nestjs/config'
import { GenerateSummaryDto } from './dto/generate-summary.dto'
import { OptimizeArticleDto } from './dto/optimize-article.dto'
import { DeepSeekMessage, DeepSeekOptions, DeepSeekResponse } from '@coblog/types'

@Injectable()
export class AiService {
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
      throw new InternalServerErrorException('未配置 DEEPSEEK_API_KEY')
    }
  }

  // 兼容字符串、数组块等不同返回结构，尽量提取出模型真正生成的文本。
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

  private extractJsonBlock<T>(content: string): T | null {
    const trimmed = content.trim()

    const fencedMatch = trimmed.match(/```json\s*([\s\S]*?)\s*```/i)
    const candidate = fencedMatch?.[1] || trimmed

    try {
      return JSON.parse(candidate) as T
    } catch {
      return null
    }
  }

  // 和 DeepSeek 的 chat 接口通信，统一处理鉴权、错误和文本抽取。
  private async requestDeepSeek(
     messages: DeepSeekMessage[],
     model:string = this.model,
     options:DeepSeekOptions = {},
  ) {
    this.ensureConfigured()
    //解构options的值
    const {
      thinking = {type:'disabled'},
      max_tokens,
      response_format = { type: 'text' }, 
      stop,
      stream = false,
      stream_options,
      temperature = 0.24,
      top_p,
      user_id,
    } = options
  
  //构建请求体
  const requestBody = {
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
  }

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(
        requestBody,
      ),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new BadGatewayException(`DeepSeek 请求失败：${errorText.slice(0, 200)}`)
    }

    const payload = (await response.json()) as DeepSeekResponse
    const content = this.extractMessageContent(payload)

    if (!content) {
      throw new BadGatewayException('DeepSeek 未返回有效内容')    
    }

    return content
  }

  // 优化正文时要求模型只返回整理后的 Markdown，方便直接回填编辑器。
  async optimizeArticle(dto: OptimizeArticleDto) {
    const systemPrompt = [
      '你是一个帮助开发者整理学习笔记的 Markdown 助手。',
      '你的任务是优化文章表达和 Markdown 格式，但不能编造事实。',
      '保留原有标题层级、代码块、列表、引用、链接和技术结论。',
      '如果内容明显口语化，可以适当润色成更自然的技术博客表达。',
      '最终只输出优化后的 Markdown 正文，不要解释。',
    ].join('')

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
      {
        temperature: 0.24,
      }
    )

    return { content }
  }

  // 生成概括时返回 JSON，前端可以直接回填摘要和 summary 字段。
  async generateSummary(dto: GenerateSummaryDto) {
    const excerptLength = dto.excerptLength ?? 120

    const systemPrompt = [
      '你是一个帮助开发者撰写博客摘要的助手。',
      '请根据文章内容生成 JSON。',
      '返回格式必须是：{"excerpt":"...","summary":"..."}',
      `excerpt 适合文章列表展示，控制在 ${excerptLength} 字以内。`,
      'summary 可以比 excerpt 稍详细，但也要克制、准确。',
      '不要输出 JSON 之外的任何解释。',
    ].join('')

    const userPrompt = [
      dto.title ? `文章标题：${dto.title}` : '',
      dto.instruction ? `额外要求：${dto.instruction}` : '',
      '请为下面的 Markdown 正文生成概括：',
      dto.content,
    ]
      .filter(Boolean)
      .join('\n\n')

    const content = await this.requestDeepSeek(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
     'deepseek-v4-flash',
      {
        temperature: 0.24,
      }
    )

    const parsed = this.extractJsonBlock<{ excerpt?: string; summary?: string }>(content)

    if (!parsed?.excerpt && !parsed?.summary) {
      throw new BadGatewayException('DeepSeek 返回的摘要格式无法解析')
    }

    return {
      excerpt: parsed.excerpt?.trim() || parsed.summary?.trim() || '',
      summary: parsed.summary?.trim() || parsed.excerpt?.trim() || '',
    }
  }

  // 提供连续问答能力，让模型围绕当前标题、正文和用户问题生成可直接使用的 Markdown。
  async chatArticleAssistant(dto: ArticleChatDto) {
    const systemPrompt = [
      '你是一个帮助开发者写技术文章的 AI 助手。',
      '你要优先输出结构清晰、能直接粘贴进博客编辑器的 Markdown。',
      '如果用户要求生成正文，请直接给出完整 Markdown，包括标题层级、列表、引用、代码块和总结。',
      '如果用户是在追问某个概念，请先解释，再给出可以写进文章的 Markdown 片段。',
      '不要使用“下面是优化结果”之类废话，尽量直接输出内容本体。',
      '不能编造不存在的 API、结论或代码行为。',
    ].join('')

    const contextPrompt = [
      dto.title ? `当前文章标题：${dto.title}` : '',
      dto.instruction ? `写作要求：${dto.instruction}` : '',
      dto.content?.trim() ? `当前正文草稿：\n${dto.content}` : '当前正文草稿为空，你可以根据用户问题直接生成 Markdown。',
    ]
      .filter(Boolean)
      .join('\n\n')
     const messages: DeepSeekMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: contextPrompt },
      ...dto.messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    ]

    const content = await this.requestDeepSeek(messages, this.model, {
      temperature: 0.24,
    })

    return { content }
  }
}
