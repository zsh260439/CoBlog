import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { JwtModule } from '@nestjs/jwt'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { Login, LoginSchema } from './schema/auth.schema'
import { AuthGuard } from './auth.guard'
import { AuthInitService } from './auth-init.service'
import { RateLimitModule } from 'src/rate-limit/rate-limit.module'
@Module({
    imports:[
        MongooseModule.forFeature([
            {name:Login.name,schema:LoginSchema}
        ]),
        RateLimitModule,
        JwtModule.register({
            secret:process.env.JWT_SECRET,
            signOptions:{expiresIn:'1d'}
        })
    ],
    controllers:[AuthController],
    providers:[AuthService,AuthGuard,AuthInitService],
    exports:[AuthGuard,JwtModule]
})
export class AuthModule {}
