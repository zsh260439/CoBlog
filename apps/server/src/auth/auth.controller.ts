import {Controller,Post,Body,Res,Req, UnauthorizedException, UseGuards} from '@nestjs/common'
import {AuthService} from './auth.service'
import {LoginDto} from './dto/login.dto'
import {ApiResponse} from '../common/utils/api-response'
import type { Request, Response} from 'express'
import { JwtService } from '@nestjs/jwt'
import { AuthGuard } from './auth.guard'
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService:AuthService,
        private readonly jwtService:JwtService
    ){}
    //登录
    @Post('login')
    async login(
    @Body() loginDto:LoginDto,
    @Res({passthrough:true}) response:Response
    ) {
        //1:创建用户信息
        const data = await this.authService.login(loginDto)
        //2:登陆成功后存入cookie
        response.cookie('refresh_token',data.refreshToken,{
            httpOnly:true,//前端无法读取 防xss攻击
            sameSite:'lax',// 防CSRF跨站攻击
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000
        })
        //3:返回给前端 只返回短token
        return ApiResponse.success({
        accessToken: data.accessToken,
        user: data.user
         },
        '登录成功')
    }

    //刷新token
    @Post('refresh')
    async refresh(
      @Req() request: Request,
      @Res({ passthrough: true }) response: Response
    ){
       const refreshToken = request.cookies?.refresh_token
       if(!refreshToken) throw new UnauthorizedException('缺少refreshToken')
        //校验这个token是否有效 同时解码出用户所有基本信息
       const payload = await this.jwtService.verifyAsync(refreshToken as string,{
         secret:process.env.JWT_REFRESH_SECRET
       })
       //调用刷新令牌的方法，传入用户id和旧刷新令牌 获取新的令牌数据
       const data = await this.authService.refreshToken(payload.userId as string,refreshToken as string)
       //将新的令牌写入响应cookie,配置cookie安全属性
       response.cookie('refresh_token',data.refreshToken,{
         httpOnly: true,    // 仅服务端可访问，防止XSS攻击
         sameSite: 'lax',   // 限制跨站请求，防范CSRF攻击
          secure: process.env.NODE_ENV === 'production',
           maxAge: 7 * 24 * 60 * 60 * 1000  // Cookie有效期
        })
       return ApiResponse.success({
           //返回给前端一个短期令牌
          accessToken:data.accessToken
       }, '刷新成功')
    }
    //登出
    @UseGuards(AuthGuard)
    @Post('logout')
    async logout(
        @Req() request:any,
        @Res({passthrough:true}) response:Response
    ){
       await this.authService.logout(request.user.userId as string)
       response.clearCookie('refresh_token')
       return ApiResponse.success(null,'退出成功')
    }
}
