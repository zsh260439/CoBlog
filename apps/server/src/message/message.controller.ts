import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  InternalServerErrorException,
  MessageEvent,
  Param,
  Patch,
  Post,
  Req,
  Res,
  Sse,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { randomUUID } from 'crypto'
import type { Request, Response } from 'express'
import { map } from 'rxjs'
import { AuthGuard } from 'src/auth/auth.guard'
import { RateLimitService } from 'src/rate-limit/rate-limit.service'
import { ApiResponse } from '../common/utils/api-response'
import { getClientIp } from '../common/utils/get-client-ip'
import { CreateAdminReplyDto } from './dto/create-admin-reply.dto'
import { CreateMessageDto } from './dto/create-message.dto'
import { MessageService } from './message.service'

const VISITOR_TOKEN_COOKIE = 'visitor_token'
const VISITOR_TOKEN_TTL = 365 * 24 * 60 * 60 * 1000

@Controller('messages')
export class MessageController {
  constructor(
    private readonly messageService: MessageService,
    private readonly jwtService: JwtService,
    private readonly rateLimitService: RateLimitService,
  ) {}

  private getVisitorTokenSecret() {
    const secret = process.env.VISITOR_TOKEN_SECRET || process.env.JWT_SECRET
    if (!secret) {
      throw new InternalServerErrorException('Visitor token secret is not configured')
    }

    return secret
  }

  private issueVisitorToken(response: Response, visitorId?: string) {
    const secret = this.getVisitorTokenSecret()
    const token = this.jwtService.sign(
      { visitorId: visitorId || randomUUID() },
      {
        secret,
        expiresIn: '1y',
      },
    )

    response.cookie(VISITOR_TOKEN_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: VISITOR_TOKEN_TTL,
    })

    return token
  }

  private resolveVisitorId(req: Request, response: Response) {
    const secret = this.getVisitorTokenSecret()
    const visitorToken = req.cookies?.[VISITOR_TOKEN_COOKIE]
    if (typeof visitorToken === 'string' && visitorToken.trim()) {
      try {
        const payload = this.jwtService.verify(visitorToken, {
          secret,
        }) as { visitorId?: string }

        if (payload.visitorId) {
          return payload.visitorId
        }
      } catch {
        // 旧 token、伪造 token 或密钥轮换后，重新签发干净的匿名身份。
      }
    }

    const newToken = this.issueVisitorToken(response)
    const payload = this.jwtService.verify(newToken, {
      secret,
    }) as { visitorId?: string }

    return payload.visitorId || randomUUID()
  }

  @Get()
  async findAll() {
    const data = await this.messageService.findAllApproved()
    return ApiResponse.success(data, '获取留言成功')
  }

  @Get('mine')
  async findMine(@Req() req: Request, @Res({ passthrough: true }) response: Response) {
    const visitorId = this.resolveVisitorId(req, response)
    const data = await this.messageService.findMine(visitorId)
    return ApiResponse.success(data, '获取我的留言成功')
  }

  @Post()
  async create(
    @Body() createMessageDto: CreateMessageDto,
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const ip = getClientIp(req)
    await this.rateLimitService.assertAllowed('messages:create', ip || 'unknown', {
      limit: 10,
      windowMs: 10 * 60 * 1000,
    })

    const visitorId = this.resolveVisitorId(req, response)
    const data = await this.messageService.create(createMessageDto, ip, visitorId)
    return ApiResponse.success(data, '提交留言成功', 201)
  }

  @UseGuards(AuthGuard)
  @Get('admin')
  async findAllAdmin() {
    const data = await this.messageService.findAllAdmin()
    return ApiResponse.success(data, '获取留言管理列表成功')
  }

  @UseGuards(AuthGuard)
  @Patch(':id/approve')
  async approve(@Param('id') id: string) {
    const data = await this.messageService.approve(id)
    return ApiResponse.success(data, '留言审核通过')
  }

  @UseGuards(AuthGuard)
  @Patch(':id/reject')
  async reject(@Param('id') id: string) {
    const data = await this.messageService.reject(id)
    return ApiResponse.success(data, '留言已拒绝')
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.messageService.remove(id)
    return ApiResponse.success(data, '留言删除成功')
  }

  @UseGuards(AuthGuard)
  @Post(':id/admin-reply')
  async adminReply(
    @Param('id') id: string,
    @Body() dto: CreateAdminReplyDto,
    @Req() req: Request,
  ) {
    const ip = getClientIp(req)
    const data = await this.messageService.createAdminReply(id, dto, ip)
    return ApiResponse.success(data, '站长回复成功', 201)
  }

  @Sse('stream')
  stream(@Req() req: Request, @Headers('last-event-id') lastEventId?: string) {
    const refreshToken = req.cookies?.refresh_token
    if (!refreshToken) {
      throw new UnauthorizedException('未登录')
    }

    this.jwtService.verify(refreshToken, {
      secret: process.env.JWT_REFRESH_SECRET,
    })

    return this.messageService.stream(lastEventId).pipe(map((data): MessageEvent => ({ ...data })))
  }
}
