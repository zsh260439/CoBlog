import {Controller,Get,Post,Body} from '@nestjs/common'
import {MessageService} from './message.service'
import {CreateMessageDto} from './dto/create-message.dto'
import {ApiResponse} from '../common/utils/api-response'
@Controller('messages')
export class MessageController {
    constructor(private readonly messageService:MessageService){}
    // 获取所有消息
    @Get()
    async findAll(){
        const data = await this.messageService.findAll()
        return ApiResponse.success(data,'获取留言成功')
    }
    // 创建消息
    @Post()
     async create(@Body() createMessageDto: CreateMessageDto) {
    const data = await this.messageService.create(createMessageDto)
    return ApiResponse.success(data, '提交留言成功')
  }
}