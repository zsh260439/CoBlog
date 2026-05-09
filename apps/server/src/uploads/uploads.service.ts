import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UploadFile, UploadFileDocument } from "./schema/upload-file.schema";

@Injectable()
export class UploadsService {
  constructor(@InjectModel(UploadFile.name) private readonly model: Model<UploadFileDocument>) { }

  async create(file: Express.Multer.File) {
    const doc = await this.model.create({
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      data: file.buffer,
      usage: 'article-image',
    })
    return {
      _id: doc._id.toString(),
      url: `/uploads/images/${doc._id}`,
      originalName: doc.originalName,
      mimeType: doc.mimeType,
      size: doc.size,
      usage: doc.usage,
      createdAt: doc.createdAt.toISOString(),
    }
  }

  async find(key: string) {
    const doc = await this.model.collection.findOne({
      _id: key,
    } as any)
    if (!doc) throw new NotFoundException()
    return doc as unknown as UploadFileDocument
  }
}
