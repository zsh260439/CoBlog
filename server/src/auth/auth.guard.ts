import {
    //守卫接口
   CanActivate,
   //获取前端请求信息
   ExecutionContext,
   Injectable,
   //未登录异常
   UnauthorizedException
} from '@nestjs/common'
//引入jwt服务 用于验证token是否合法
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class AuthGuard implements CanActivate {
    //注入jwt工具 验证token 
    constructor(private readonly jwtService:JwtService){}
    async canActivate(context:ExecutionContext) {
        //1:获取前端发来的请求对象
        const request = context.switchToHttp().getRequest()
        //2:从请求头中获取accesstoken
        const authorization = request.headers.authorization
        if(!authorization) throw new UnauthorizedException('未登录!')
        //3:拆分token格式 Bearer token
        const [type,token] = authorization.split(' ')
        //4:如果发现前缀不对
        if(type !== 'Bearer' || !token) throw new UnauthorizedException('Token无效!')
        //5:验证token是否合法
       try {
        //用密钥验证token 同时解码成对象
        const payload = await this.jwtService.verifyAsync(token as string,{
            secret:process.env.JWT_SECRET
        })
        //6:如果验证通过 把payload挂载到请求对象上 后续可以在控制器中获取(非常重要)
        request.user = payload
        return true
       } catch  {
        throw new UnauthorizedException('Token无效!')
       }
    }
}