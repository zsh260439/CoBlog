import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path'
import { NestExpressApplication } from '@nestjs/platform-express'
import cookieParser from 'cookie-parser';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(cookieParser())
  app.enableCors({
    origin:true,
    //允许携带cookie
    credentials:true
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  )
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
  prefix: '/uploads',
})
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
