import { ConflictException, Injectable,NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Article, ArticleDocument } from '../articles/schema/article.schema'
import { CreateCategoryDto } from './dto/create-category.dto'
import { CreateTagDto } from './dto/create-tag.dto'
import { Category, CategoryDocument } from './schema/category.schema'
import { Tag, TagDocument } from './schema/tag.schema'
@Injectable()
export class TaxonomyService {
  constructor(
    @InjectModel(Category.name) private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(Tag.name) private readonly tagModel: Model<TagDocument>,
    @InjectModel(Article.name) private readonly articleModel: Model<ArticleDocument>
  ) {}

  private toISO(date: Date | string): string {
    return new Date(date).toISOString()
  }
// 列表分类
  async listCategories() {
    //并行请求两个数据库，一个是分类表，一个是文章表
    const [categories, counts] = await Promise.all([
      this.categoryModel.find().sort({ createdAt: 1 }).lean(),
      this.articleModel.aggregate<{ _id: string; count: number; label: string }>([
        {
          $group: {
            _id: '$categorySlug', // 例如：life
            count: { $sum: 1 },
            label: { $first: '$category' } // 例如：生活
          }
        }
      ])
    ])

    const countMap = new Map(counts.map((item) => [item._id, item.count]))
    return categories.map((category) => ({
      _id: String(category._id),
      label: category.label,
      slug: category.slug,
      count: countMap.get(category.slug) || 0,
      createdAt: this.toISO(category.createdAt),
      updatedAt: this.toISO(category.updatedAt),
    }))
  }
    // 创建分类
  async createCategory(createCategoryDto: CreateCategoryDto) {
    const label = createCategoryDto.label.trim()
    const slug = createCategoryDto.slug.trim()

    const existingCategory = await this.categoryModel.findOne({
      $or: [{ label }, { slug }]
    })

    if (existingCategory) {
      throw new ConflictException('分类名称或 slug 已存在')
    }

    const category = await this.categoryModel.create({ label, slug })

    return {
      _id: category._id.toString(),
      label: category.label,
      slug: category.slug,
      count: 0,
      createdAt: this.toISO(category.createdAt),
      updatedAt: this.toISO(category.updatedAt),
    }
  }
// 列表标签
  async listTags() {
    const [tags, counts] = await Promise.all([
      this.tagModel.find().sort({ createdAt: 1 }).lean(),
      this.articleModel.aggregate<{ _id: string; count: number }>([
        { $unwind: { path: '$tags', preserveNullAndEmptyArrays: false } },
        { $group: { _id: '$tags', count: { $sum: 1 } } }
      ])
    ])

    const countMap = new Map(counts.map((item) => [item._id, item.count]))
    return tags.map((tag) => ({
      _id: String(tag._id),
      label: tag.label,
      slug: tag.slug,
      count: countMap.get(tag.label) || 0,
      createdAt: this.toISO(tag.createdAt),
      updatedAt: this.toISO(tag.updatedAt),
    }))
  }
// 创建标签
  async createTag(createTagDto: CreateTagDto) {
    const label = createTagDto.label.trim()
    const slug = createTagDto.slug.trim()

    const existingTag = await this.tagModel.findOne({
      $or: [{ label }, { slug }]
    })

    if (existingTag) {
      throw new ConflictException('标签名称或 slug 已存在')
    }

    const tag = await this.tagModel.create({ label, slug })

    return {
      _id: tag._id.toString(),
      label: tag.label,
      slug: tag.slug,
      count: 0,
      createdAt: this.toISO(tag.createdAt),
      updatedAt: this.toISO(tag.updatedAt),
    }
  }
  //删除分类,如果要删除全部文章，要用到promise
  async removeCategory(slug: string): Promise<{ deletedCount: number }> {
    const category = await this.categoryModel.findOneAndDelete({slug})
    if(!category){
      throw new NotFoundException('分类不存在')
    }
    return this.articleModel.deleteMany({categorySlug:category.slug})
  }
  //删除标签
  async removeTag(slug:string):Promise<{deletedCount:number}>{
    const tag = await this.tagModel.findOne({ slug })
    if(!tag){
      throw new NotFoundException('标签不存在')
    }
    //同步文章的标签 因为一个文章tag可能很多，所以要精准定位tag并且只修改这个tag
    const updateResult = await this.articleModel.updateMany(
      { tags: tag.label },
      { $pull: { tags: tag.label } }
    )

    await this.tagModel.deleteOne({ slug })

    return {
      deletedCount: updateResult.modifiedCount
    }
  }
  //更新分类 其中所对应的文章数量也需要更新
  async updateCategory(slug:string,categoryDto:CreateCategoryDto){
    const newLabelTrim = categoryDto.label.trim()
    const newSlugTrim = categoryDto.slug.trim()
    //首先找到旧的分类
    const oldCategory = await this.categoryModel.findOne({slug})
    if(!oldCategory){
      throw new NotFoundException('分类不存在')
    }
    //然后更新分类
    await this.categoryModel.findOneAndUpdate({slug},{
        label:newLabelTrim,
        slug:newSlugTrim
    },
    {returnDocument:'after'}
  )
  //同步文章的分类
  await this.articleModel.updateMany({categorySlug:oldCategory.slug},{
    category:newLabelTrim,
    categorySlug:newSlugTrim
  })
   //统计文章数量
   const count = await this.articleModel.countDocuments({categorySlug:newSlugTrim})
   //给前端返回
   return {
     count,
     label:newLabelTrim,
     slug:newSlugTrim,
   }
  }
  //更新标签
  async updateTag(slug:string,tagDto:CreateTagDto){
    const oldTag = await this.tagModel.findOne({ slug })

    if(!oldTag){
      throw new NotFoundException('标签不存在')
    }

    const newLabelTrim = tagDto.label.trim()
    const newSlugTrim = tagDto.slug.trim()

    const tag = await this.tagModel.findOneAndUpdate(
      { slug },
      {
        label: newLabelTrim,
        slug: newSlugTrim
      },
      { returnDocument:'after' }
    )

    if (!tag) {
      throw new NotFoundException('标签不存在')
    }

    //同步文章的标签 因为一个文章tag可能很多，所以要精准定位tag并且只修改这个tag
    await this.articleModel.updateMany(
      { tags: oldTag.label },
      {
        $set:{
          'tags.$[elem]': newLabelTrim,
        },
      },
      {
        arrayFilters:[{elem: oldTag.label}]
      }
    )

    const count = await this.articleModel.countDocuments({ tags: newLabelTrim })

   return {
     count,
      label: tag.label,
      slug: tag.slug,
    }
  }
}
