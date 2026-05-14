import { Module } from '@nestjs/common'
import { ArticlesModule } from '../articles/article.module'
import { TaxonomyModule } from '../taxonomy/taxonomy.module'
import { SeoController } from './seo.controller'
import { SeoService } from './seo.service'

@Module({
  imports: [ArticlesModule, TaxonomyModule],
  controllers: [SeoController],
  providers: [SeoService],
})
export class SeoModule {}
