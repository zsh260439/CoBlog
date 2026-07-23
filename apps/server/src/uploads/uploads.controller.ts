import { BadRequestException, Controller, Get, Param, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'
import type { Request, Response } from 'express'
import { ApiResponse } from 'src/common/utils/api-response'
import { getClientIp } from 'src/common/utils/get-client-ip'
import { AuthGuard } from 'src/auth/auth.guard'
import { UploadsService } from './uploads.service'
import { RateLimitService } from 'src/rate-limit/rate-limit.service'

const ALLOWED_IMAGE_MIME_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif'])

@Controller('uploads')
export class UploadsController {
  constructor(
    private readonly uploadsService: UploadsService,
    private readonly rateLimitService: RateLimitService,
  ) {}

  @UseGuards(AuthGuard)
  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 1024 * 1024 * 5 },
      fileFilter: (_req, file, callback) => {
        if (!ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype)) {
          callback(new BadRequestException('Only PNG, JPEG, WEBP and GIF images are allowed'), false)
          return
        }

        callback(null, true)
      },
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    const ip = getClientIp(req) || 'unknown'
    await this.rateLimitService.assertAllowed('uploads:image', ip, {
      limit: 20,
      windowMs: 60 * 60 * 1000,
    })

    if (!file) {
      throw new BadRequestException('Image file is required')
    }

    const data = await this.uploadsService.create(file)
    return ApiResponse.success(data, '上传成功', 201)
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
