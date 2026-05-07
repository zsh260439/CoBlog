import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

@Schema({ timestamps: true })
export class Visit {
  @Prop({ required: true, trim: true })
  path: string

  @Prop({ required: true, trim: true })
  ip: string

  @Prop({ default: '' })
  location: string

  @Prop({ default: '' })
  userAgent: string

  createdAt: Date
  updatedAt: Date
}

export type VisitDocument = HydratedDocument<Visit>
export const VisitSchema = SchemaFactory.createForClass(Visit)
