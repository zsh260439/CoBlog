import { Controller, Get, Param, Post, Res, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { UploadsService } from "./uploads.service";
import type { Request, Response } from 'express'
import { memoryStorage } from "multer";
import { ApiResponse } from "src/common/utils/api-response";
import { AuthGuard } from "src/auth/auth.guard";

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) { }

  @UseGuards(AuthGuard)
  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: (_req: Request, file: Express.Multer.File, callback: (error: Error | null, acceptFile: boolean) => void) => {
        if (!file.mimetype.startsWith('image/')) {
          callback(new Error('只支持上传图片文件'), false)
          return
        }
        callback(null, true)
      },
      limits: {
        fileSize: 1024 * 1024 * 5,
      }
    })
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    const data = await this.uploadsService.createUploadFile(file);
    return ApiResponse.success(data, '上传成功')
  }

  @Get('images/:id')
  async serveImage(@Param('id') id: string, @Res() res: Response) {
    let file = await this.uploadsService.findById(id)

    if (!file) {
      file = await this.uploadsService.findByFilename(id)
    }

    if (!file || !file.data) {
      res.status(404).send('图片不存在')
      return
    }

    const mimeType = file.mimeType || 'image/png'
    const raw = (file.data as any).buffer ? Buffer.from((file.data as any).buffer) : Buffer.from(file.data as any || '')
    res.setHeader('Content-Type', mimeType)
    res.setHeader('Cache-Control', 'public, max-age=3600')
    res.send(raw)
  }
}
