import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

@Schema({ timestamps: true })
export class UploadFile {
  @Prop({ trim: true })
  filename?: string

  @Prop({ required: true, trim: true })
  originalName: string

  @Prop({ required: true, trim: true })
  mimeType: string

  @Prop({ required: true })
  size: number

  @Prop({ required: true })
  data: Buffer

  @Prop({ default: 'article-image', trim: true })
  usage: string

  createdAt: Date
  updatedAt: Date
}

export type UploadFileDocument = HydratedDocument<UploadFile>
export const UploadFileSchema = SchemaFactory.createForClass(UploadFile)
