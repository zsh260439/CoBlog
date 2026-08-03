import { Body, Controller, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import type { Request, Response } from 'express'
import { ApiResponse } from '../common/utils/api-response'
import { getClientIp } from '../common/utils/get-client-ip'
import { RateLimitService } from 'src/rate-limit/rate-limit.service'
import { AuthGuard } from './auth.guard'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly rateLimitService: RateLimitService,
  ) {}

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const ip = getClientIp(req) || 'unknown'
    await this.rateLimitService.assertAllowed('auth:login', ip, {
      limit: 5,
      windowMs: 15 * 60 * 1000,
    })

    const data = await this.authService.login(loginDto)
    response.cookie('refresh_token', data.refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000,
    })

    return ApiResponse.success(
      {
        accessToken: data.accessToken,
        user: data.user,
      },
      '登录成功',
    )
  }

  @Post('refresh')
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const ip = getClientIp(request) || 'unknown'
    await this.rateLimitService.assertAllowed('auth:refresh', ip, {
      limit: 20,
      windowMs: 10 * 60 * 1000,
    })

    const refreshToken = request.cookies?.refresh_token
    if (!refreshToken) throw new UnauthorizedException('缺少refreshToken')

    const payload = await this.jwtService.verifyAsync(refreshToken as string, {
      secret: process.env.JWT_REFRESH_SECRET,
    })
    const data = await this.authService.refreshToken(payload.userId as string, refreshToken as string)

    response.cookie('refresh_token', data.refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      // 与 JWT 长 token 的 1 天有效期保持一致，避免 cookie 还在但 token 已过期
      maxAge: 24 * 60 * 60 * 1000,
    })

    return ApiResponse.success(
      {
        accessToken: data.accessToken,
      },
      '刷新成功',
    )
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  async logout(
    @Req() request: any,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.logout(request.user.userId as string)
    response.clearCookie('refresh_token')
    return ApiResponse.success(null, '退出成功')
  }
}
