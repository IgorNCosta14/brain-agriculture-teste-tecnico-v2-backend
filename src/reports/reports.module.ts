import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { ReportsReadRepository } from './repositories/implementation/reports-read.repository';
import { Property } from '../properties/property.entity';
import { PropertyCrop } from '../property-crops/property-crop.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Property, PropertyCrop])],
    controllers: [ReportsController],
    providers: [ReportsService, ReportsReadRepository],
})
export class ReportsModule { }