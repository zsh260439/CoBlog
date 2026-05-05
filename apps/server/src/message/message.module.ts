import { Module } from "@nestjs/common";
import { MessageService } from "./message.service";
import { MessageController } from "./message.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Message, MessageSchema } from "./schema/message.schema";
import { AuthModule } from "src/auth/auth.module";
@Module({
    imports:[
        MongooseModule.forFeature([{
            name: Message.name,
            schema: MessageSchema,
        }]),
        AuthModule,
    ],
    controllers:[MessageController],
    providers:[MessageService],
    exports:[MessageService],
})

export class MessageModule {}
