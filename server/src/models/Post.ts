import mongoose, { Schema, Document } from 'mongoose'

export interface IPost extends Document {
  title: string
  content: string
  excerpt: string
  category: string
  tags: string[]
  coverImage?: string
  createdAt: Date
  updatedAt: Date
}

const PostSchema: Schema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  excerpt: { type: String, required: true },
  category: { type: String, required: true },
  tags: { type: [String], default: [] },
  coverImage: { type: String },
}, {
  timestamps: true
})

export default mongoose.model<IPost>('Post', PostSchema)
