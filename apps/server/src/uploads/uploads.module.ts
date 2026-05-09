import { Module } from "@nestjs/common";
import { UploadsController } from "./uploads.controller";
import { UploadsService } from "./uploads.service";
import { MongooseModule } from "@nestjs/mongoose";
import { UploadFileSchema } from "./schema/upload-file.schema";
import { UploadFile } from "./schema/upload-file.schema";
import { AuthModule } from "src/auth/auth.module";
@Module({
    imports:[
        MongooseModule.forFeature([{
            name:UploadFile.name,
            schema:UploadFileSchema,
        }]),
        AuthModule
    ],
    controllers:[UploadsController],
    providers:[UploadsService],
})

export class UploadsModule {}
