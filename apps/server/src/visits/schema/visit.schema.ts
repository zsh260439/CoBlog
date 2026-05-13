import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

@Schema({ timestamps: true })
export class Visit {
  @Prop({ default: '', trim: true })
  ip: string

  @Prop({ default: '', trim: true })
  senderId: string

  @Prop({ default: '' })
  location: string

  @Prop({ default: '' })
  userAgent: string

  @Prop({ default: '' })
  lastPath: string

  @Prop()
  lastActiveAt: Date
}

export type VisitDocument = HydratedDocument<Visit>
export const VisitSchema = SchemaFactory.createForClass(Visit)
