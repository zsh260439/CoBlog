import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { CreateArticleDto } from './dto/create-article.dto'
import { UpdateArticleDto } from './dto/update-article.dto'
import { Article, ArticleDocument } from './schema/article.schema'
import  {ImageService}  from 'src/utils/image.service'
@Injectable()
export class ArticlesService {
  constructor(@InjectModel(Article.name)
   private readonly articleModel: Model<ArticleDocument>,
   private readonly imageService:ImageService
  ) {}

  private stripMarkdown(content: string) {
    return content.replace(/[`#>*_\-[\]()!]/g, '').replace(/\s+/g, '')
  }

  private serializeArticle(article: Record<string, any> | null) {
    if (!article) {
      return article
    }

    return {
      ...article,
      _id: String(article._id),
      createdAt: article.createdAt ? new Date(article.createdAt).toISOString() : article.createdAt,
      updatedAt: article.updatedAt ? new Date(article.updatedAt).toISOString() : article.updatedAt,
    }
  }

  async findAll() {
    const articles = await this.articleModel.find().sort({ createdAt: -1 }).lean()
    return articles.map((article:Article) => this.serializeArticle(article))
  }

  async findBySlug(slug: string) {
    const article = await this.articleModel.findOneAndUpdate({ slug }, { $inc: { views: 1 } }, { returnDocument: 'after' }).lean()

    if (!article) {
      throw new NotFoundException('文章不存在')
    }
    //创建上一篇/下一篇
    const [prev,next] =await Promise.all([
         //上一篇
         this.articleModel.findOne(
          //条件 查找小于当前事件的文章
          {createdAt:{$lt:article.createdAt}},
          {slug:1,title:1}
         )
         .sort({createdAt:-1})
         .lean(),
        this.articleModel.findOne(
          //返回的是从最大到小的
          {createdAt:{$gt:article.createdAt}},
           {slug:1,title:1}
        )
        //找到最近的那一个
        .sort({createdAt:1})
        .lean()
    ])
    //优先找：同分类,排除当前文章,最新的6篇文章
    const related = await this.articleModel.find(
      {categorySlug:article.categorySlug,slug:{$ne:slug}},
      {slug:1,title:1,coverImage:1,excerpt:1,createdAt:1}
    )
    .sort({createdAt:-1})
    .limit(6)
    .lean()

    return {
      ...this.serializeArticle(article),
      previous:prev?{slug:prev.slug,title:prev.title}:null,
      next:next?{slug:next.slug,title:next.title}:null,
      related:related.map((r:Article)=>this.serializeArticle(r))
    }
  }

  async findById(id: string) {
    const article = await this.articleModel.findById(id).lean()

    if (!article) {
      throw new NotFoundException('文章不存在')
    }

    return this.serializeArticle(article)
  }

  async findByCategory(categorySlug: string) {
    const articles = await this.articleModel.find({ categorySlug }).sort({ createdAt: -1 }).lean()
    return articles.map((article:Article) => this.serializeArticle(article))
  }

  async findByTag(tag: string) {
    const articles = await this.articleModel.find({ tags: tag }).sort({ createdAt: -1 }).lean()
    return articles.map((article:Article) => this.serializeArticle(article))
  }

  async findArchiveList() {
    const articles = await this.articleModel.find().sort({ createdAt: -1 }).lean()
    const groupMap = new Map<string, Article[]>()

    articles.forEach((article:Article) => {
      const year = new Date(article.createdAt).getFullYear().toString()
      const currentGroup = groupMap.get(year) ?? []
      currentGroup.push(article)
      groupMap.set(year, currentGroup)
    })

    return [...groupMap.entries()].map(([year, items]) => ({
      year,
      articles: items.map((article:Article) => this.serializeArticle(article)),
    }))
  }
 
  async create(createArticleDto: CreateArticleDto) {
     let coverImage = createArticleDto.coverImage?.trim() || ''
     if(!coverImage) {
       coverImage = await this.imageService.getRandomCoverImage()
     }
    const article = await this.articleModel.create({
      ...createArticleDto,
      coverImage,
      wordCount: this.stripMarkdown(createArticleDto.content ?? '').length,
    })

    return this.serializeArticle(article.toObject())
  }

  async update(id: string, updateArticleDto: UpdateArticleDto) {
    //加上更新的图片
    let coverImage = updateArticleDto.coverImage?.trim() || ''
     if(!coverImage) {
       coverImage = await this.imageService.getRandomCoverImage()
     }
    //创建个新对象
    const updatePayload: Record<string, unknown> = { ...updateArticleDto,coverImage }
    
    if (typeof updatePayload.content === 'string' && typeof updatePayload.wordCount !== 'number') {
      updatePayload.wordCount = this.stripMarkdown(updatePayload.content).length
    }

    const article = await this.articleModel.findByIdAndUpdate(id, updatePayload, { returnDocument: 'after' }).lean()
     
    if (!article) {
      throw new NotFoundException('文章不存在')
    }

    return this.serializeArticle(article)
  }

  async remove(id: string) {
    const article = await this.articleModel.findByIdAndDelete(id).lean()

    if (!article) {
      throw new NotFoundException('文章不存在')
    }

    return this.serializeArticle(article)
  }
}
