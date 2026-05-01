import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AiModule } from './ai/ai.module';
import { ArticlesModule } from './articles/article.module';
import { MessageModule } from './message/message.module';
import { TaxonomyModule } from './taxonomy/taxonomy.module';
import { AuthModule } from './auth/auth.module';
import { UploadsModule } from './uploads/uploads.module';
@Module({
   imports:[
      ConfigModule.forRoot({
       isGlobal:true,
       envFilePath: ['../../.env.development.local','../../.env', '.env']
      }),
      MongooseModule.forRoot(process.env.MONGODB_URI as string),
      AiModule,
      ArticlesModule,
     MessageModule,
     TaxonomyModule,
     AuthModule,
     UploadsModule,
    ],
})
export class AppModule {}
