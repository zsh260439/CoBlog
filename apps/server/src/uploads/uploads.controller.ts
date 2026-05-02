import { Controller, Get, Param, Post, Res, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import type { Response } from 'express'
import { ApiResponse } from "src/common/utils/api-response";
import { AuthGuard } from "src/auth/auth.guard";
import { UploadsService } from "./uploads.service";

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) { }

  @UseGuards(AuthGuard)
  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 1024 * 1024 * 5 },
    })
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    const data = await this.uploadsService.create(file)
    return ApiResponse.success(data, '上传成功')
  }

  @Get('images/:id')
  async serveImage(@Param('id') id: string, @Res() res: Response) {
    const file = await this.uploadsService.find(id)
    const buf = Buffer.from(file.data.buffer)
    res.setHeader('Content-Type', file.mimeType || 'image/png')
    res.setHeader('Cache-Control', 'public, max-age=86400')
    res.send(buf)
  }
}
