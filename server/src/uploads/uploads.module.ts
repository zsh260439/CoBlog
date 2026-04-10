import { Module } from "@nestjs/common";
import { UploadsController } from "./uploads.controller";
import { UploadsService } from "./uploads.service";
import { MongooseModule } from "@nestjs/mongoose";
import { UploadFileSchema } from "./schema/upload-file.schema";
import { UploadFile } from "./schema/upload-file.schema";
@Module({
    imports:[
        MongooseModule.forFeature([{
            name:UploadFile.name,
            schema:UploadFileSchema,
        }])
    ],
    controllers:[UploadsController],
    providers:[UploadsService],
    exports:[UploadsService],
})

export class UploadsModule {}
