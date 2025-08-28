import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PropertyCrop } from "./property-crop.entity";

@Module({
    imports: [TypeOrmModule.forFeature([PropertyCrop])],
    controllers: [],
    providers: [],
})
export class PropertyCropsModule { }
