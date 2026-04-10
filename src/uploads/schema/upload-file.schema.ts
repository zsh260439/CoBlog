import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

@Schema({ timestamps: true })
export class UploadFile {
    // 文件名
  @Prop({ required: true, trim: true })
  filename: string
  // 原始文件名
  @Prop({ required: true, trim: true })
  originalName: string
  // 文件类型
  @Prop({ required: true, trim: true })
  mimeType: string
  // 文件大小
  @Prop({ required: true })
  size: number
  // 文件 URL
  @Prop({ required: true, trim: true })
  url: string
  // 存储路径
  @Prop({ required: true, trim: true })
  storagePath: string
  // 文件用途
  @Prop({ default: 'article-image', trim: true })
  usage: string
  // 创建时间
  createdAt: Date
  updatedAt: Date
}

export type UploadFileDocument = HydratedDocument<UploadFile>
export const UploadFileSchema = SchemaFactory.createForClass(UploadFile)