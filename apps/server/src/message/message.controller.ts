import { Body, Controller, Delete, Get, MessageEvent, Param, Patch, Post, Query, Req, Sse, UnauthorizedException, UseGuards } from '@nestjs/common'
import {MessageService} from './message.service'
import {CreateMessageDto} from './dto/create-message.dto'
import { CreateAdminReplyDto } from './dto/create-admin-reply.dto'
import {ApiResponse} from '../common/utils/api-response'
import { getClientIp } from '../common/utils/get-client-ip'
import type { Request } from 'express'
import { AuthGuard } from 'src/auth/auth.guard'
import { JwtService } from '@nestjs/jwt'
import { map } from 'rxjs'
@Controller('messages')
export class MessageController {
    constructor(
      private readonly messageService:MessageService,
      private readonly jwtService: JwtService,
    ){}

    // 公开页只拿审核通过的留言。
    @Get()
    async findAll(){
        const data = await this.messageService.findAllApproved()
        return ApiResponse.success(data,'获取留言成功')
    }

    // 当前浏览器自己的留言状态恢复：pending / rejected。
    @Get('mine/:senderId')
    async findMine(@Param('senderId') senderId: string) {
      const data = await this.messageService.findMine(senderId)
      return ApiResponse.success(data, '获取我的留言成功')
    }

    // 创建留言时，从请求头取真实 IP，让后端补 location、做 pending 限流。
  @Post()
     async create(@Body() createMessageDto: CreateMessageDto, @Req() req: Request) {
    const ip = getClientIp(req) || '127.0.0.1'
    const data = await this.messageService.create(createMessageDto, ip)
    return ApiResponse.success(data, '提交留言成功')
  }

  // admin 管理页完整列表。
  @UseGuards(AuthGuard)
  @Get('admin')
  async findAllAdmin() {
    const data = await this.messageService.findAllAdmin()
    return ApiResponse.success(data, '获取留言管理列表成功')
  }

  // admin 通过留言。
  @UseGuards(AuthGuard)
  @Patch(':id/approve')
  async approve(@Param('id') id: string) {
    const data = await this.messageService.approve(id)
    return ApiResponse.success(data, '留言审核通过')
  }

  // admin 拒绝留言。
  @UseGuards(AuthGuard)
  @Patch(':id/reject')
  async reject(@Param('id') id: string) {
    const data = await this.messageService.reject(id)
    return ApiResponse.success(data, '留言已拒绝')
  }

  // admin 删除留言。
  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.messageService.remove(id)
    return ApiResponse.success(data, '留言删除成功')
  }

  @UseGuards(AuthGuard)
  @Post(':id/admin-reply')
  async adminReply(@Param('id') id: string, @Body() dto: CreateAdminReplyDto, @Req() req: Request) {
    const ip = getClientIp(req) || '127.0.0.1'
    const data = await this.messageService.createAdminReply(id, dto, ip)
    return ApiResponse.success(data, '站长回复成功')
  }

  // SSE 用 query token 做登录校验，前端只负责订阅即可。
  @Sse('stream')
  stream(@Query('token') token: string) {
    if (!token) throw new UnauthorizedException('未登录')
    this.jwtService.verify(token, { secret: process.env.JWT_SECRET })
    return this.messageService.stream().pipe(map((data): MessageEvent => ({ data })))
  }
}
