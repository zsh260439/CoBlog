import { Body, Controller, Headers, MessageEvent, Param, Post, Req, Sse, UnauthorizedException, UseGuards } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import type { Request } from 'express'
import { map, Observable } from 'rxjs'
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

@Controller('ai/article')
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly rateLimitService: RateLimitService,
    private readonly jwtService: JwtService,
  ) {}

  @UseGuards(AuthGuard)
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

  @UseGuards(AuthGuard)
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

  @UseGuards(AuthGuard)
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

  @UseGuards(AuthGuard)
  @Post('chat/stream-session')
  async createStreamSession(@Body() dto: ArticleChatDto, @Req() req: Request) {
    const userId = String((req as AuthenticatedRequest).user?.userId || 'unknown')
    await this.rateLimitService.assertAllowed('ai:chat:stream', userId, {
      limit: 20,
      windowMs: 60 * 60 * 1000,
    })

    const data = this.aiService.createArticleStreamSession(userId, dto)
    return ApiResponse.success(data, 'AI stream session created')
  }

  @Sse('chat/stream/:sessionId')
  streamChat(
    @Param('sessionId') sessionId: string,
    @Headers('last-event-id') lastEventId: string | undefined,
    @Req() req: Request,
  ): Observable<MessageEvent> {
    const refreshToken = req.cookies?.refresh_token
    if (!refreshToken) {
      throw new UnauthorizedException('未登录')
    }

    const payload = this.jwtService.verify(refreshToken, {
      secret: process.env.JWT_REFRESH_SECRET,
    }) as { userId?: string }
    return this.aiService
      .streamArticleSession(
        sessionId,
        String(payload.userId || 'unknown'),
        lastEventId,
      )
      .pipe(
        map((event): MessageEvent => ({
          id: event.id,
          type: event.type,
          data: event.data,
          retry: event.retry,
        })),
      )
  }
}
