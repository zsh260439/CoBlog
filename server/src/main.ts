import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path'
import { NestExpressApplication } from '@nestjs/platform-express'
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({
    origin:'http://localhost:5173',
    credentials:true
  });
  app.useGlobalPipes(
    new ValidationPipe({
     whitelist: true,         // 只允许 DTO 里定义的字段
    forbidNonWhitelisted: true, // 多传字段直接报错！
    transform: true          // 自动类型转换
    })
  )
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
  prefix: '/uploads',
})
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
