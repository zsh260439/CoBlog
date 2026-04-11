import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path'
import { NestExpressApplication } from '@nestjs/platform-express'
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || /^http:\/\/localhost:(5173|5174|5175|4173)$/.test(origin)) {
        callback(null, true)
        return
      }

      callback(new Error(`CORS blocked for origin: ${origin}`), false)
    },
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
