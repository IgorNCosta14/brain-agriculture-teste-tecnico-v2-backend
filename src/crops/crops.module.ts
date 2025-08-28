import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Crop } from './crop.entity';
import { CropsController } from './crops.controller';
import { CropRepository } from './repositories/implementation/crop.repository';
import { CropsService } from './crops.service';

@Module({
    imports: [TypeOrmModule.forFeature([Crop])],
    controllers: [CropsController],
    providers: [CropsService, CropRepository],
})
export class CropsModule { }
