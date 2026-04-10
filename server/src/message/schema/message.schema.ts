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

  @Prop({ default: '' })
  location: string

  @Prop({ default: '' })
  device: string

  @Prop({ default: '' })
  browser: string

  @Prop({ default: false })
  isPrivate: boolean

  @Prop({ default: false })
  enableEmailNotice: boolean

  @Prop({ default: true })
  useMarkdown: boolean

  createdAt: Date
  updatedAt: Date
}
export type MessageDocument = HydratedDocument<Message>
export const MessageSchema = SchemaFactory.createForClass(Message)