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

  private buildExcerpt(content: string) {
    return content
      .replace(/[`#>*_\-[\]()!]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 140)
  }

  private normalizeArticle(article: any) {
    const content = typeof article?.content === 'string' ? article.content : ''
    const excerpt = typeof article?.excerpt === 'string' && article.excerpt.trim()
      ? article.excerpt.trim()
      : this.buildExcerpt(content as string)
    const summary = typeof article?.summary === 'string' && article.summary.trim()
      ? article.summary.trim()
      : excerpt

    return {
      ...article,
      _id: article?._id?.toString?.() ?? article?._id,
      title: typeof article?.title === 'string' ? article.title.trim() : '未命名文章',
      slug: typeof article?.slug === 'string' ? article.slug.trim() : '',
      content,
      excerpt,
      summary,
      category: typeof article?.category === 'string' ? article.category.trim() : '未分类',
      categorySlug: typeof article?.categorySlug === 'string' ? article.categorySlug.trim() : '',
      tags: Array.isArray(article?.tags)
        ? article.tags.filter((item: unknown) => typeof item === 'string' && item.trim().length > 0)
        : [],
      coverImage: typeof article?.coverImage === 'string' && article.coverImage.trim() ? article.coverImage.trim() : undefined,
      views: typeof article?.views === 'number' ? article.views : 0,
      comments: typeof article?.comments === 'number' ? article.comments : 0,
      likes: typeof article?.likes === 'number' ? article.likes : 0,
      wordCount:
        typeof article?.wordCount === 'number' && article.wordCount > 0
          ? article.wordCount
          : this.stripMarkdown(content as string).length,
      createdAt: article?.createdAt ? new Date(article.createdAt as string | number | Date).toISOString() : new Date().toISOString(),
      updatedAt: article?.updatedAt ? new Date(article.updatedAt as string | number | Date).toISOString() : new Date().toISOString(),
    }
  }

  async findAll() {
    const articles = await this.articleModel.find().sort({ createdAt: -1 }).lean()
    return articles.map((article) => this.normalizeArticle(article))
  }

  async findBySlug(slug: string) {
    const article = await this.articleModel.findOneAndUpdate({ slug }, { $inc: { views: 1 } }, { new: true }).lean()

    if (!article) {
      throw new NotFoundException('文章不存在')
    }

    return this.normalizeArticle(article)
  }

  async findById(id: string) {
    const article = await this.articleModel.findById(id).lean()

    if (!article) {
      throw new NotFoundException('文章不存在')
    }

    return this.normalizeArticle(article)
  }

  async findByCategory(categorySlug: string) {
    const articles = await this.articleModel.find({ categorySlug }).sort({ createdAt: -1 }).lean()
    return articles.map((article) => this.normalizeArticle(article))
  }

  async findByTag(tag: string) {
    const articles = await this.articleModel.find({ tags: tag }).sort({ createdAt: -1 }).lean()
    return articles.map((article) => this.normalizeArticle(article))
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
      articles: items.map((article) => this.normalizeArticle(article)),
    }))
  }

  async create(createArticleDto: CreateArticleDto) {
    const article = await this.articleModel.create({
      ...createArticleDto,
      title: createArticleDto.title.trim(),
      slug: createArticleDto.slug.trim(),
      content: createArticleDto.content.trim(),
      excerpt: createArticleDto.excerpt.trim(),
      summary: createArticleDto.summary.trim(),
      category: createArticleDto.category.trim(),
      categorySlug: createArticleDto.categorySlug.trim(),
      tags: (createArticleDto.tags ?? []).map((tag) => tag.trim()).filter(Boolean),
      coverImage: createArticleDto.coverImage?.trim() || undefined,
      views: createArticleDto.views ?? 0,
      comments: createArticleDto.comments ?? 0,
      likes: createArticleDto.likes ?? 0,
      wordCount: createArticleDto.wordCount ?? this.stripMarkdown(createArticleDto.content).length,
    })

    return this.normalizeArticle(article.toObject())
  }

  async update(id: string, updateArticleDto: UpdateArticleDto) {
    const updatePayload: Record<string, unknown> = {}

    if (typeof updateArticleDto.title === 'string') updatePayload.title = updateArticleDto.title.trim()
    if (typeof updateArticleDto.slug === 'string') updatePayload.slug = updateArticleDto.slug.trim()
    if (typeof updateArticleDto.content === 'string') updatePayload.content = updateArticleDto.content.trim()
    if (typeof updateArticleDto.excerpt === 'string') updatePayload.excerpt = updateArticleDto.excerpt.trim()
    if (typeof updateArticleDto.summary === 'string') updatePayload.summary = updateArticleDto.summary.trim()
    if (typeof updateArticleDto.category === 'string') updatePayload.category = updateArticleDto.category.trim()
    if (typeof updateArticleDto.categorySlug === 'string') updatePayload.categorySlug = updateArticleDto.categorySlug.trim()
    if (Array.isArray(updateArticleDto.tags)) updatePayload.tags = updateArticleDto.tags.map((tag) => tag.trim()).filter(Boolean)
    if (typeof updateArticleDto.coverImage === 'string') updatePayload.coverImage = updateArticleDto.coverImage.trim() || undefined
    if (typeof updateArticleDto.views === 'number') updatePayload.views = updateArticleDto.views
    if (typeof updateArticleDto.comments === 'number') updatePayload.comments = updateArticleDto.comments
    if (typeof updateArticleDto.likes === 'number') updatePayload.likes = updateArticleDto.likes

    if (typeof updateArticleDto.wordCount === 'number') {
      updatePayload.wordCount = updateArticleDto.wordCount
    } else if (typeof updatePayload.content === 'string') {
      updatePayload.wordCount = this.stripMarkdown(updatePayload.content).length
    }

    const article = await this.articleModel.findByIdAndUpdate(id, updatePayload, { new: true }).lean()

    if (!article) {
      throw new NotFoundException('文章不存在')
    }

    return this.normalizeArticle(article)
  }

  async remove(id: string) {
    const article = await this.articleModel.findByIdAndDelete(id).lean()

    if (!article) {
      throw new NotFoundException('文章不存在')
    }

    return this.normalizeArticle(article)
  }
}
