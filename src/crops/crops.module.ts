import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Crop } from './crop.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Crop])],
    controllers: [],
    providers: [],
})
export class CropsModule { }
