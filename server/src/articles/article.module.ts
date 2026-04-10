import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Article, ArticleSchema } from "./schema/article.schema";
import { ArticlesController } from "./article.controller";
import { ArticlesService } from "./article.service";

@Module({
   imports:[
   MongooseModule.forFeature([{
     name:Article.name,
     schema:ArticleSchema
   }])
   ],
   controllers:[ArticlesController],
   providers:[ArticlesService],
   exports:[ArticlesService]
})
export class ArticlesModule {}