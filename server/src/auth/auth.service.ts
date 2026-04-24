import {Injectable} from '@nestjs/common'
import {Model} from 'mongoose'
import {Login, LoginDocument} from './schema/auth.schema'
import {InjectModel} from '@nestjs/mongoose'
import {JwtService} from '@nestjs/jwt'
import {LoginDto} from './dto/login.dto'
import {UnauthorizedException} from '@nestjs/common'
import * as bcrypt from 'bcrypt'
@Injectable()
export class AuthService {
 constructor(@InjectModel(Login.name)
private readonly loginModel:Model<LoginDocument>,
private readonly jwtService:JwtService
){}
   //验证用户(辅助)
   async validateUser(loginDto:LoginDto) {
       const {username,password} = loginDto
       //查库 这里查找用户
       const user = await this.loginModel.findOne({username})
       if(!user) throw new UnauthorizedException('用户名不存在!')
       //如果找到了 user携带的是用户的所有数据 这个时候来验证密码
       const isPasswordValid = await bcrypt.compare(password,user.password)
       if(!isPasswordValid) throw new UnauthorizedException('密码错误!')
      //返回用户给上层生成token使用
       return user
   }
   //生成双token 实现无感登录 这里的user是上面验证后返回的user(辅助)
   async generateTokens(user:LoginDocument){
        //构造jwt载荷
        const payload = {
            userId : user._id,
            username:user.username,
            role:user.role
        }
     //生成访问令牌 请求接口时携带
     const accessToken = await this.jwtService.signAsync(payload,{
         secret:process.env.JWT_SECRET,
         expiresIn:'20m'
     })
     //生成刷新令牌 处理过期的accessToken
     const refreshToken = await this.jwtService.signAsync(payload,{
         secret:process.env.JWT_REFRESH_SECRET,
         expiresIn:'1d'
     })
     //返回两个token给前端
     return {
        accessToken,
        refreshToken
     }
   }
    //登录
    async login(loginDto:LoginDto){
        //1:验证用户
       const user = await this.validateUser(loginDto)
       //2:生成双token
       const token = await this.generateTokens(user)
       //3:刷新令牌加密
       const refreshTokenHash = await bcrypt.hash(token.refreshToken,10)
       //4:存储加密令牌
       await this.loginModel.findByIdAndUpdate(user._id,{
          refreshToken:refreshTokenHash
       })
       //5:返回给前端 短token 长token 用户信息
       return {
        accessToken:token.accessToken,
        refreshToken:token.refreshToken,
        user:{
            userId:user._id,
            username:user.username,
            role:user.role
        }
       }
    }
    //刷新令牌接口
    async refreshToken(userId:string,refreshToken:string){
        //1:根据用户的id查库 拿到完整的用户信息 主要是加密长token
        const user = await this.loginModel.findById(userId)
        //2:如果用户不存在或者没存过长哈希token
        if(!user || !user.refreshToken) throw new UnauthorizedException('RefreshToken无效!')
        //3:对比逻辑是否匹配
       const isMatch = await bcrypt.compare(refreshToken,user.refreshToken)
        if(!isMatch) throw new UnauthorizedException('RefreshToken无效!')
        //4:生成新的双token 短+长
        const newToken = await this.generateTokens(user)
        //5:加密长token
        const refreshTokenHash = await bcrypt.hash(newToken.refreshToken,10)
        //6:更新数据库
        await this.loginModel.findByIdAndUpdate(user._id,{
            refreshToken:refreshTokenHash
        })
        //7:返回新的长短token
        return {
            accessToken:newToken.accessToken,
            refreshToken:newToken.refreshToken
        }
    }
    //登出
    async logout(userId:string){
        await this.loginModel.findByIdAndUpdate(userId,{
            refreshToken:''
        })
        return {success:true}
    }
}
