import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { CreateArticleDto } from './dto/create-article.dto'
import { UpdateArticleDto } from './dto/update-article.dto'
import { Article, ArticleDocument } from './schema/article.schema'

@Injectable()
export class ArticlesService {
  constructor(@InjectModel(Article.name) private readonly articleModel: Model<ArticleDocument>) {}

  private stripMarkdown(content: string) {
    return content.replace(/[`#>*_\-[\]()!]/g, '').replace(/\s+/g, '')
  }

  private serializeArticle(article: any) {
    if (!article) {
      return article
    }

    return {
      ...article,
      _id: article._id?.toString?.() ?? article._id,
      tags: Array.isArray(article.tags) ? article.tags : [],
      createdAt: article.createdAt?.toISOString?.() ?? article.createdAt,
      updatedAt: article.updatedAt?.toISOString?.() ?? article.updatedAt,
    }
  }

  async findAll() {
    const articles = await this.articleModel.find().sort({ createdAt: -1 }).lean()
    return articles.map((article) => this.serializeArticle(article))
  }

  async findBySlug(slug: string) {
    const article = await this.articleModel.findOneAndUpdate({ slug }, { $inc: { views: 1 } }, { new: true }).lean()

    if (!article) {
      throw new NotFoundException('文章不存在')
    }

    return this.serializeArticle(article)
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
    return articles.map((article) => this.serializeArticle(article))
  }

  async findByTag(tag: string) {
    const articles = await this.articleModel.find({ tags: tag }).sort({ createdAt: -1 }).lean()
    return articles.map((article) => this.serializeArticle(article))
  }

  async findArchiveList() {
    const articles = await this.articleModel.find().sort({ createdAt: -1 }).lean()
    const groupMap = new Map<string, typeof articles>()

    articles.forEach((article) => {
      const year = new Date(article.createdAt).getFullYear().toString()
      const currentGroup = groupMap.get(year) ?? []
      currentGroup.push(article)
      groupMap.set(year, currentGroup)
    })

    return [...groupMap.entries()].map(([year, items]) => ({
      year,
      articles: items.map((article) => this.serializeArticle(article)),
    }))
  }

  async create(createArticleDto: CreateArticleDto) {
    const article = await this.articleModel.create({
      ...createArticleDto,
      wordCount: createArticleDto.wordCount ?? this.stripMarkdown(createArticleDto.content ?? '').length,
    })

    return this.serializeArticle(article.toObject())
  }

  async update(id: string, updateArticleDto: UpdateArticleDto) {
    const updatePayload: Record<string, unknown> = { ...updateArticleDto }

    if (typeof updatePayload.content === 'string' && typeof updatePayload.wordCount !== 'number') {
      updatePayload.wordCount = this.stripMarkdown(updatePayload.content).length
    }

    const article = await this.articleModel.findByIdAndUpdate(id, updatePayload, { new: true }).lean()

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
