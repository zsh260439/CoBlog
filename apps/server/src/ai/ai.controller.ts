import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { AuthGuard } from 'src/auth/auth.guard'
import { ApiResponse } from 'src/common/utils/api-response'
import { AiService } from './ai.service'
import { ArticleChatDto } from './dto/article-chat.dto'
import { GenerateExcerptDto } from './dto/generate-excerpt.dto'
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

  @Post('excerpt')
  async excerpt(@Body() dto: GenerateExcerptDto) {
    const data = await this.aiService.generateExcerpt(dto)
    return ApiResponse.success(data, 'AI 摘要生成成功')
  }

  @Post('chat')
  async chat(@Body() dto: ArticleChatDto) {
    const data = await this.aiService.chatArticleAssistant(dto)
    return ApiResponse.success(data, 'AI 助手回复成功')
  }
}
