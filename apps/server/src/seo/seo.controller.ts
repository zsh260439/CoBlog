import { Controller, Get, Header } from '@nestjs/common'
import { SeoService } from './seo.service'

@Controller('seo')
export class SeoController {
  constructor(private readonly seoService: SeoService) {}

  @Get('sitemap.xml')
  @Header('Content-Type', 'application/xml; charset=utf-8')
  async getSitemapXml() {
    return this.seoService.getSitemapXml()
  }
}
