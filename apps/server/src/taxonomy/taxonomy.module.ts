import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Article, ArticleSchema } from '../articles/schema/article.schema'
import { TaxonomyController } from './taxonomy.controller'
import { TaxonomyService } from './taxonomy.service'
import { Category, CategorySchema } from './schema/category.schema'
import { Tag, TagSchema } from './schema/tag.schema'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
      { name: Tag.name, schema: TagSchema },
      { name: Article.name, schema: ArticleSchema },
    ]),
    AuthModule,
  ],
  controllers: [TaxonomyController],
  providers: [TaxonomyService],
  exports: [TaxonomyService],
})
export class TaxonomyModule {}
