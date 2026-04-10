import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ArticlesModule } from './articles/article.module';
import { MessageModule } from './message/message.module';
import { TaxonomyModule } from './taxonomy/taxonomy.module';
import { UploadsModule } from './uploads/uploads.module';
@Module({
   imports:[
     ConfigModule.forRoot({
      isGlobal:true
     }),
     MongooseModule.forRoot(process.env.MONGODB_URI as string),
     ArticlesModule,
     MessageModule,
     TaxonomyModule,
     UploadsModule,
    ],
})
export class AppModule {}
