import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import * as bcrypt from 'bcrypt'
import { Login, LoginDocument } from './schema/auth.schema'

@Injectable()
export class AuthInitService implements OnModuleInit {
  private readonly logger = new Logger(AuthInitService.name)

  constructor(
    @InjectModel(Login.name) private readonly loginModel: Model<LoginDocument>,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    const existingCount = await this.loginModel.estimatedDocumentCount()
    if (existingCount > 0) {
      return
    }

    const username = this.configService.get<string>('INIT_ADMIN_USERNAME')?.trim() || ''
    const password = this.configService.get<string>('INIT_ADMIN_PASSWORD')?.trim() || ''

    if (!username || !password) {
      this.logger.warn('login 集合为空，且未提供 INIT_ADMIN_USERNAME / INIT_ADMIN_PASSWORD，已跳过管理员初始化')
      return
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    await this.loginModel.create({
      username,
      password: hashedPassword,
      role: 'admin',
      refreshToken: '',
    })

    this.logger.log(`已自动初始化管理员账号: ${username}`)
  }
}
