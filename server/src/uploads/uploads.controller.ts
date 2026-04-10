import { Controller, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { UploadsService } from "./uploads.service";
import { diskStorage } from "multer";
import { ApiResponse } from "src/common/utils/api-response";
import { extname } from "path";
@Controller('uploads')
export class UploadsController {
    constructor(private readonly uploadsService:UploadsService){}

   @Post('image')
   @UseInterceptors(
    FileInterceptor('file',{
        storage:diskStorage({
            destination:'./uploads/images',
            filename:(_,file,callback)=>{
                const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${extname(file.originalname)}`
                callback(null,uniqueName)
            },
        }),
        fileFilter:(_,file,callback)=>{
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