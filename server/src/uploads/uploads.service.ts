import { Injectable } from "@nestjs/common";
import { UploadFileDocument,UploadFile } from "./schema/upload-file.schema";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";

@Injectable()
export class UploadsService {
   constructor(@InjectModel(UploadFile.name) private readonly uploadFileModel:Model<UploadFileDocument>){}
  //创建文件
  async createUploadFile (file:Express.Multer.File){
    // 归一化文件路径 浏览器
      const normalizedPath = file.path.replace(/\\/g, '/')
      const url = `/uploads/images/${file.filename}`

      const uploadFile = await this.uploadFileModel.create({
        filename:file.filename,
        originalName:file.originalname,
        mimeType:file.mimetype,
        size:file.size,
        url,
        //标准化后的本地路径
        storagePath:normalizedPath,
        usage:'article-image',
      })
    return {
      _id: uploadFile._id.toString(),
      filename: uploadFile.filename,
      originalName: uploadFile.originalName,
      mimeType: uploadFile.mimeType,
      size: uploadFile.size,
      url: uploadFile.url,
      storagePath: uploadFile.storagePath,
      usage: uploadFile.usage,
      createdAt: uploadFile.createdAt?.toISOString?.() ?? new Date().toISOString(),
      updatedAt: uploadFile.updatedAt?.toISOString?.() ?? new Date().toISOString(),
       }
    }
}