import { Body, Controller, Get, Post, Req } from '@nestjs/common'
import type { Request } from 'express'
import { ApiResponse } from '../common/utils/api-response'
import { TrackVisitDto } from './dto/track-visit.dto'
import { VisitsService } from './visits.service'

@Controller('visits')
export class VisitsController {
  constructor(private readonly visitsService: VisitsService) {}

  @Post('track')
  async track(@Body() dto: TrackVisitDto, @Req() req: Request) {
    const forwarded = req.headers['x-forwarded-for']
    const ip = Array.isArray(forwarded)
      ? forwarded[0]
      : forwarded?.split(',')[0]?.trim() || req.ip || ''
    const data = await this.visitsService.track(dto, ip, req.headers['user-agent'] || '')
    return ApiResponse.success(data, '记录访问成功')
  }

  @Get('stats')
  async stats() {
    const [summary, about] = await Promise.all([
      this.visitsService.getPublicStats(),
      this.visitsService.getAboutStats(),
    ])

    return ApiResponse.success({
      summary,
      trend: about.trend,
      cities: about.cities,
    }, '获取访问统计成功')
  }
}
