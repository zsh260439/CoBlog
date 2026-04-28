import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true, unique: true, trim: true })
  label: string

  @Prop({ required: true, unique: true, index: true, trim: true })
  slug: string

  createdAt: Date
  updatedAt: Date
}

export type CategoryDocument = HydratedDocument<Category>
export const CategorySchema = SchemaFactory.createForClass(Category)
