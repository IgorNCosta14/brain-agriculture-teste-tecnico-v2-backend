import { Module } from '@nestjs/common';
import { ProducersModule } from './producers/producers.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigTypeOrm } from './config/typeorm.config';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(ConfigTypeOrm()),
    ProducersModule
  ]
})
export class AppModule { }
