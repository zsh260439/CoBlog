import { Controller, Get, Header } from '@nestjs/common'
import { ApiResponse } from '../common/utils/api-response'
import { SeoService } from './seo.service'

@Controller('seo')
export class SeoController {
  constructor(private readonly seoService: SeoService) {}

  @Get('sitemap')
  async getSitemapData() {
    const data = await this.seoService.getSitemapData()
    return ApiResponse.success(data, '获取 sitemap 数据成功')
  }

  @Get('sitemap.xml')
  @Header('Content-Type', 'application/xml; charset=utf-8')
  async getSitemapXml() {
    return this.seoService.getSitemapXml()
  }
}
