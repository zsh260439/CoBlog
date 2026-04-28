import { Controller, Post, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { UploadsService } from "./uploads.service";
import type { Request } from 'express'
import { diskStorage } from "multer";
import { ApiResponse } from "src/common/utils/api-response";
import { extname } from "path";
import { AuthGuard } from "src/auth/auth.guard";
@Controller('uploads')
export class UploadsController {
    constructor(private readonly uploadsService:UploadsService){}

   @UseGuards(AuthGuard)
   @Post('image')
   @UseInterceptors(
    FileInterceptor('file',{
        storage:diskStorage({
            destination:'./uploads/images',
            filename:(_req: Request,file: Express.Multer.File,callback: (error: Error | null, filename: string) => void)=>{
                const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${extname(file.originalname)}`
                callback(null,uniqueName)
            },
        }),
        fileFilter:(_req: Request,file: Express.Multer.File,callback: (error: Error | null, acceptFile: boolean) => void)=>{
            if(!file.mimetype.startsWith('image/')){
                callback(new Error('只支持上传图片文件'),false)
                return
            }
            callback(null,true)
        },
        limits:{
            fileSize:1024 * 1024 * 5,
        }
    })
   )
   
   async uploadImage(@UploadedFile() file: Express.Multer.File) {
    const data= await this.uploadsService.createUploadFile(file);
    return ApiResponse.success(data,'上传成功')
   }
}
