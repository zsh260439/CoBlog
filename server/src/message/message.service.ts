import {Injectable} from '@nestjs/common'
import {InjectModel} from '@nestjs/mongoose'
import {Message,MessageDocument} from './schema/message.schema'
import {Model} from 'mongoose'
import {CreateMessageDto} from './dto/create-message.dto'
@Injectable()
export class MessageService {
    constructor(@InjectModel(Message.name) private readonly messageModel:Model<MessageDocument>){}
    // 查找所有消息
    async findAll(){
          return this.messageModel.find().sort({ createdAt: -1 }).lean()
    }
    //创建消息
    async create(createMessageDto:CreateMessageDto){
      return this.messageModel.create(createMessageDto)
    }
}
