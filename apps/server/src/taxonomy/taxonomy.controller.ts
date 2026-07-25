import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { ApiResponse } from '../common/utils/api-response'
import { TaxonomyService } from './taxonomy.service'
import { CreateCategoryDto } from './dto/create-category.dto'
import { CreateTagDto } from './dto/create-tag.dto'
import { AuthGuard } from '../auth/auth.guard'

@Controller('taxonomies')
export class TaxonomyController {
  constructor(private readonly taxonomyService: TaxonomyService) {}

  @Get('categories')
  async listCategories() {
    const data = await this.taxonomyService.listCategories()
    return ApiResponse.success(data, '获取分类列表成功')
  }

  @UseGuards(AuthGuard)
  @Post('categories')
  async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    const data = await this.taxonomyService.createCategory(createCategoryDto)
    return ApiResponse.success(data, '创建分类成功', 201)
  }

  @Get('tags')
  async listTags() {
    const data = await this.taxonomyService.listTags()
    return ApiResponse.success(data, '获取标签列表成功')
  }

  @UseGuards(AuthGuard)
  @Post('tags')
  async createTag(@Body() createTagDto: CreateTagDto) {
    const data = await this.taxonomyService.createTag(createTagDto)
    return ApiResponse.success(data, '创建标签成功', 201)
  }

  @UseGuards(AuthGuard)
  @Delete('categories/:slug')
  async removeCategory(@Param('slug') slug: string) {
    await this.taxonomyService.removeCategory(slug)
    return ApiResponse.success({}, '删除分类成功')
  }

  @UseGuards(AuthGuard)
  @Delete('tags/:slug')
  async removeTag(@Param('slug') slug: string) {
    await this.taxonomyService.removeTag(slug)
    return ApiResponse.success({}, '删除标签成功')
  }

  @UseGuards(AuthGuard)
  @Patch('categories/:slug')
  async updateCategory(@Param('slug') slug: string, @Body() createCategoryDto: CreateCategoryDto) {
    const data = await this.taxonomyService.updateCategory(slug, createCategoryDto)
    return ApiResponse.success(data, '更新分类成功')
  }

  @UseGuards(AuthGuard)
  @Patch('tags/:slug')
  async updateTag(@Param('slug') slug: string, @Body() createTagDto: CreateTagDto) {
    const data = await this.taxonomyService.updateTag(slug, createTagDto)
    return ApiResponse.success(data, '更新标签成功')
  }
}
