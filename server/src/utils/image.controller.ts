import { Controller,Get } from "@nestjs/common";
import { ImageService } from "./image.service";
import { ApiResponse } from "src/common/utils/api-response";
@Controller('image')
export class ImageController {
     constructor(private readonly imageService:ImageService){}
     
     @Get()
     async getImage(){
        const data =  await this.imageService.getRandomCoverImage()
        return ApiResponse.success(data)
     }
}