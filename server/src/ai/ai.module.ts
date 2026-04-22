import { Module } from '@nestjs/common'
import { AuthModule } from 'src/auth/auth.module'
import { AiController } from './ai.controller'
import { AiService } from './ai.service'

@Module({
  imports: [AuthModule],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
