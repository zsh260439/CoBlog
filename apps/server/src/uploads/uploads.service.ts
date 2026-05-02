import { Injectable } from "@nestjs/common";
import { UploadFile, type UploadFileDocument } from "./schema/upload-file.schema";
import type { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";

@Injectable()
export class UploadsService {
  constructor(@InjectModel(UploadFile.name) private readonly uploadFileModel: Model<UploadFileDocument>) { }

  async createUploadFile(file: Express.Multer.File) {
    const uploadFile = await this.uploadFileModel.create({
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      data: file.buffer,
      usage: 'article-image',
    })

    return {
      _id: uploadFile._id.toString(),
      originalName: uploadFile.originalName,
      mimeType: uploadFile.mimeType,
      size: uploadFile.size,
      url: `/uploads/images/${uploadFile._id}`,
      usage: uploadFile.usage,
      createdAt: uploadFile.createdAt.toISOString(),
    }
  }

  async findById(id: string) {
    try {
      const file = await this.uploadFileModel.findById(id).exec()
      return file as UploadFileDocument | null
    } catch {
      return null
    }
  }

  async findByFilename(filename: string) {
    const file = await this.uploadFileModel.findOne({ filename }).select('+data')
    return file
  }
}
