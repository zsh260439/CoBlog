import { Module } from "@nestjs/common";
import { MessageService } from "./message.service";
import { MessageController } from "./message.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Message, MessageSchema } from "./schema/message.schema";
import { AuthModule } from "src/auth/auth.module";
import { MessageMailService } from "./message-mail.service";
import { RateLimitModule } from "src/rate-limit/rate-limit.module";
@Module({
    imports:[
        MongooseModule.forFeature([{
            name: Message.name,
            schema: MessageSchema,
        }]),
        AuthModule,
        RateLimitModule,
    ],
    controllers:[MessageController],
    providers:[MessageService, MessageMailService],
})

export class MessageModule {}
