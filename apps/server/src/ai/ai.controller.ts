import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common'
import type { Request, Response } from 'express'
import { AuthGuard } from 'src/auth/auth.guard'
import { ApiResponse } from 'src/common/utils/api-response'
import { RateLimitService } from 'src/rate-limit/rate-limit.service'
import { AiService } from './ai.service'
import { ArticleChatDto } from './dto/article-chat.dto'
import { GenerateExcerptDto } from './dto/generate-excerpt.dto'
import { OptimizeArticleDto } from './dto/optimize-article.dto'

type AuthenticatedRequest = Request & {
  user?: {
    userId?: string
  }
}

@UseGuards(AuthGuard)
@Controller('ai/article')
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly rateLimitService: RateLimitService,
  ) {}

  @Post('optimize')
  async optimize(@Body() dto: OptimizeArticleDto, @Req() req: Request) {
    const userId = String((req as AuthenticatedRequest).user?.userId || 'unknown')
    await this.rateLimitService.assertAllowed('ai:optimize', userId, {
      limit: 30,
      windowMs: 60 * 60 * 1000,
    })

    const data = await this.aiService.optimizeArticle(dto)
    return ApiResponse.success(data, 'AI 优化完成')
  }

  @Post('excerpt')
  async excerpt(@Body() dto: GenerateExcerptDto, @Req() req: Request) {
    const userId = String((req as AuthenticatedRequest).user?.userId || 'unknown')
    await this.rateLimitService.assertAllowed('ai:excerpt', userId, {
      limit: 30,
      windowMs: 60 * 60 * 1000,
    })

    const data = await this.aiService.generateExcerpt(dto)
    return ApiResponse.success(data, 'AI 摘要生成成功')
  }

  @Post('chat')
  async chat(@Body() dto: ArticleChatDto, @Req() req: Request) {
    const userId = String((req as AuthenticatedRequest).user?.userId || 'unknown')
    await this.rateLimitService.assertAllowed('ai:chat', userId, {
      limit: 60,
      windowMs: 60 * 60 * 1000,
    })

    const data = await this.aiService.chatArticleAssistant(dto)
    return ApiResponse.success(data, 'AI 助手回复成功')
  }

  @Post('chat/stream')
  async streamChat(@Body() dto: ArticleChatDto, @Req() req: Request, @Res() response: Response) {
    const userId = String((req as AuthenticatedRequest).user?.userId || 'unknown')
    await this.rateLimitService.assertAllowed('ai:chat:stream', userId, {
      limit: 20,
      windowMs: 60 * 60 * 1000,
    })

    response.setHeader('Content-Type', 'text/plain; charset=utf-8')
    response.setHeader('Cache-Control', 'no-cache, no-transform')
    response.setHeader('Connection', 'keep-alive')
    response.setHeader('X-Accel-Buffering', 'no')
    response.flushHeaders()

    await this.aiService.streamArticleAssistant(dto, (chunk) => {
      response.write(chunk)
    })

    response.end()
  }
}
