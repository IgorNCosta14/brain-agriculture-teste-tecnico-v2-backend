import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Harvest } from './harvest.entity';
import { HarvestsController } from './harvests.controller';
import { HarvestRepository } from './repositories/implementation/harvest.repository';
import { HarvestsService } from './harvests.service';

@Module({
    imports: [TypeOrmModule.forFeature([Harvest])],
    controllers: [HarvestsController],
    providers: [HarvestsService, HarvestRepository],
})

export class HarvestsModule { }
