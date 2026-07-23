import { Module } from '@nestjs/common'
import { AuthModule } from 'src/auth/auth.module'
import { RateLimitModule } from 'src/rate-limit/rate-limit.module'
import { AiController } from './ai.controller'
import { AiService } from './ai.service'

@Module({
  imports: [AuthModule, RateLimitModule],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
