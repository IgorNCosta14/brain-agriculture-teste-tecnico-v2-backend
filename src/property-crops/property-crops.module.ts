import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PropertyCrop } from "./property-crop.entity";
import { PropertyCropController } from "./property-crops.controller";
import { PropertyCropRepository } from "./repositories/implementation/property-crop.repository";
import { PropertyCropService } from "./property-crops.service";
import { CropsModule } from "../crops/crops.module";
import { HarvestsModule } from "../harvests/harvests.module";
import { PropertiesModule } from "../properties/properties.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([PropertyCrop]),
        CropsModule,
        HarvestsModule,
        PropertiesModule
    ],
    controllers: [PropertyCropController],
    providers: [PropertyCropService, PropertyCropRepository],
})
export class PropertyCropsModule { }
