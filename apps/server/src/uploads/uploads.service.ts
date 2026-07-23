import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UploadFile, UploadFileDocument } from "./schema/upload-file.schema";

const IMAGE_SIGNATURES: Array<{ mimeType: string; matches: (buffer: Buffer) => boolean }> = [
  {
    mimeType: 'image/png',
    matches: (buffer) => buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  },
  {
    mimeType: 'image/jpeg',
    matches: (buffer) => buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff,
  },
  {
    mimeType: 'image/webp',
    matches: (buffer) =>
      buffer.length >= 12 &&
      buffer.subarray(0, 4).equals(Buffer.from('RIFF')) &&
      buffer.subarray(8, 12).equals(Buffer.from('WEBP')),
  },
  {
    mimeType: 'image/gif',
    matches: (buffer) =>
      buffer.length >= 6 &&
      (buffer.subarray(0, 6).equals(Buffer.from('GIF87a')) || buffer.subarray(0, 6).equals(Buffer.from('GIF89a'))),
  },
]

@Injectable()
export class UploadsService {
  constructor(@InjectModel(UploadFile.name) private readonly model: Model<UploadFileDocument>) { }

  private ensureImageSignature(file: Express.Multer.File) {
    const matcher = IMAGE_SIGNATURES.find((item) => item.mimeType === file.mimetype)
    if (!matcher || !matcher.matches(file.buffer)) {
      throw new BadRequestException('Invalid image content')
    }
  }

  async create(file: Express.Multer.File) {
    this.ensureImageSignature(file)

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
    const doc = await this.model.findById(key).lean()
    if (!doc) throw new NotFoundException()
    return doc
  }
}
