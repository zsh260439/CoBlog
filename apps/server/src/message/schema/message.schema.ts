import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
@Schema({timestamps:true})
export class Message {
   @Prop({ required: true })
  author: string

  @Prop({ required: true })
  content: string

  @Prop()
  email?: string

  @Prop()
  qq?: string

  @Prop({ required: true, trim: true })
  senderId: string

  @Prop({ required: true, trim: true })
  ip: string

  @Prop({ default: '' })
  parentId: string

  @Prop({ required: true, trim: true })
  rootId: string

  @Prop({ default: 'visitor', enum: ['visitor', 'admin'] })
  authorType: 'visitor' | 'admin'

  @Prop({ default: '' })
  replyToAuthor: string

  @Prop({ default: '' })
  location: string

  @Prop({ default: '' })
  device: string

  @Prop({ default: '' })
  browser: string

  @Prop({ default: false })
  enableEmailNotice: boolean

  @Prop({ default: 'pending', enum: ['pending', 'approved', 'rejected'] })
  status: 'pending' | 'approved' | 'rejected'

  @Prop()
  reviewedAt?: Date

  createdAt: Date
  updatedAt: Date
}
export type MessageDocument = HydratedDocument<Message>
export const MessageSchema = SchemaFactory.createForClass(Message)
