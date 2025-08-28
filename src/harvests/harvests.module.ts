import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Harvest } from './harvest.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Harvest])],
    controllers: [],
    providers: [],
})

export class HarvestsModule { }
