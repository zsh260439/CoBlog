import { Body, Controller, Get, Post, Req } from '@nestjs/common'
import type { Request } from 'express'
import { ApiResponse } from '../common/utils/api-response'
import { getClientIp } from '../common/utils/get-client-ip'
import { RateLimitService } from 'src/rate-limit/rate-limit.service'
import { TrackVisitDto } from './dto/track-visit.dto'
import { VisitsService } from './visits.service'

@Controller('visits')
export class VisitsController {
  constructor(
    private readonly visitsService: VisitsService,
    private readonly rateLimitService: RateLimitService,
  ) {}

  @Get('location')
  async location(@Req() req: Request) {
    const ip = getClientIp(req) || 'unknown'
    await this.rateLimitService.assertAllowed('visits:location', ip, {
      limit: 30,
      windowMs: 10 * 60 * 1000,
    })

    const data = await this.visitsService.getLocation(ip)
    return ApiResponse.success(data, '获取访客位置成功')
  }

  @Post('track')
  async track(@Body() dto: TrackVisitDto, @Req() req: Request) {
    const ip = getClientIp(req) || 'unknown'
    await this.rateLimitService.assertAllowed('visits:track', `${ip}:${dto.senderId}`, {
      limit: 120,
      windowMs: 10 * 60 * 1000,
    })

    const data = await this.visitsService.track(dto, ip, req.headers['user-agent'] || '')
    return ApiResponse.success(data, '记录访问成功', 201)
  }

  @Get('stats')
  async stats() {
    const [summary, about] = await Promise.all([
      this.visitsService.getPublicStats(),
      this.visitsService.getAboutStats(),
    ])

    return ApiResponse.success(
      {
        summary,
        trend: about.trend,
        cities: about.cities,
      },
      '获取访问统计成功',
    )
  }
}
