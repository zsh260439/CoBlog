import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

@Schema({ timestamps: true })
export class Article {
  @Prop({ required: true })
  title: string

  @Prop({ required: true, unique: true, index: true })
  slug: string

  @Prop({ required: true })
  content: string

  @Prop({ required: true })
  excerpt: string

  @Prop({ required: true })
  summary: string

  @Prop({ required: true })
  category: string

  @Prop({ required: true, index: true })
  categorySlug: string

  @Prop({ type: [String], default: [] })
  tags: string[]

  @Prop()
  coverImage?: string

  @Prop({ default: 0 })
  views: number

  @Prop({ default: 0 })
  comments: number

  @Prop({ default: 0 })
  likes: number

  @Prop({ default: 0 })
  wordCount: number
  
  createdAt: Date
  updatedAt: Date
}

export type ArticleDocument = HydratedDocument<Article>
export const ArticleSchema = SchemaFactory.createForClass(Article)
