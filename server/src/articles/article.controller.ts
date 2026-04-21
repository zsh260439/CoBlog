import { Controller, Get, Param, Post, Body, Patch, Delete } from "@nestjs/common";
import { ArticlesService } from "./article.service";
import { ApiResponse } from "../common/utils/api-response";
import { CreateArticleDto } from "./dto/create-article.dto";
import { UpdateArticleDto } from "./dto/update-article.dto";
import { AuthGuard } from "../auth/auth.guard";
import { UseGuards } from "@nestjs/common";
@Controller('articles')
export class ArticlesController {
    constructor(private readonly articlesService:ArticlesService){}
    @Get()
    async findAll(){
        const data = await this.articlesService.findAll()
        if(!data){
            return ApiResponse.error('查找文章失败')
        }
        return ApiResponse.success(data,'查找文章成功')
    }
    @Get('archive/list')
    async findArchiveList(){
        const data = await this.articlesService.findArchiveList()
        return ApiResponse.success(data,'获取归档列表成功')
    }
   @Get('category/:slug')
   async findByCategory(@Param('slug') slug:string){
     const data = await this.articlesService.findByCategory(slug)
     if(!data){
         return ApiResponse.error('查找文章失败')
     }
     return ApiResponse.success(data,'查找文章成功')
    }
    @Get('tag/:tag')
    async findByTag(@Param('tag') tag:string){
      const data = await this.articlesService.findByTag(tag)
      if(!data){
          return ApiResponse.error('查找文章失败')
      }
      return ApiResponse.success(data,'查找文章成功')
    }
    @UseGuards(AuthGuard)
    @Get('id/:id')
    async findById(@Param('id') id:string){
      const data = await this.articlesService.findById(id)
      return ApiResponse.success(data,'查找文章成功')
   }
    @Get(':slug')
    async findBySlug(@Param('slug') slug:string){
      const data = await this.articlesService.findBySlug(slug)
      if(!data){
        return ApiResponse.error('查找文章失败')
      }
      return ApiResponse.success(data,'查找文章成功')
   }
   @UseGuards(AuthGuard)
   @Post()
   async create(@Body() createArticleDto:CreateArticleDto){
      const data = await this.articlesService.create(createArticleDto)
      return ApiResponse.success(data,'创建文章成功')
   }
   @UseGuards(AuthGuard)
   @Patch('id/:id')
   async update(@Param('id') id:string, @Body() updateArticleDto:UpdateArticleDto){
      const data = await this.articlesService.update(id, updateArticleDto)
      return ApiResponse.success(data,'更新文章成功')
   }
   @UseGuards(AuthGuard)
   @Delete('id/:id')
   async remove(@Param('id') id:string){
      const data = await this.articlesService.remove(id)
      return ApiResponse.success(data,'删除文章成功')
   }
}
