import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { AuthGuard } from 'src/auth/auth.guard'
import { ApiResponse } from 'src/common/utils/api-response'
import { AiService } from './ai.service'
import { ArticleChatDto } from './dto/article-chat.dto'
import { GenerateSummaryDto } from './dto/generate-summary.dto'
import { OptimizeArticleDto } from './dto/optimize-article.dto'

@UseGuards(AuthGuard)
@Controller('ai/article')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('optimize')
  async optimize(@Body() dto: OptimizeArticleDto) {
    const data = await this.aiService.optimizeArticle(dto)
    return ApiResponse.success(data, 'AI 优化完成')
  }

  @Post('summary')
  async summary(@Body() dto: GenerateSummaryDto) {
    const data = await this.aiService.generateSummary(dto)
    return ApiResponse.success(data, 'AI 概括生成成功')
  }

  @Post('chat')
  async chat(@Body() dto: ArticleChatDto) {
    const data = await this.aiService.chatArticleAssistant(dto)
    return ApiResponse.success(data, 'AI 助手回复成功')
  }
}
