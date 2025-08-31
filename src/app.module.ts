import { Module } from '@nestjs/common';
import { ProducersModule } from './producers/producers.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigTypeOrm } from './config/typeorm.config';
import { ConfigModule } from '@nestjs/config';
import { CropsModule } from './crops/crops.module';
import { HarvestsModule } from './harvests/harvests.module';
import { PropertiesModule } from './properties/properties.module';
import { PropertyCropsModule } from './property-crops/property-crops.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(ConfigTypeOrm()),
    ProducersModule,
    CropsModule,
    HarvestsModule,
    PropertiesModule,
    PropertyCropsModule,
    ReportsModule
  ]
})
export class AppModule { }
