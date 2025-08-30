import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { IPropertycropRepository } from "./repositories/property-crop-repository.interface";
import { PropertyCropRepository } from "./repositories/implementation/property-crop.repository";
import { PropertyCrop } from "./property-crop.entity";
import { PropertiesService } from "../properties/properties.service";
import { HarvestsService } from "../harvests/harvests.service";
import { CropsService } from "../crops/crops.service";
import { Property } from "../properties/property.entity";
import { createPropertyCropServiceDto } from "./dtos/create-property-crop-service.dto";

@Injectable()
export class PropertyCropService {
    constructor(
        @Inject(PropertyCropRepository)
        private readonly repo: IPropertycropRepository,
        private readonly propertiesService: PropertiesService,
        private readonly harvestsService: HarvestsService,
        private readonly cropsService: CropsService
    ) { }

    async createPropertyCrop({
        propertyId,
        harvestId,
        cropId
    }: createPropertyCropServiceDto): Promise<PropertyCrop> {
        const property = await this.propertiesService.getPropertyById(propertyId)

        if (!property) {
            throw new NotFoundException('Property not found');
        }

        const harvest = await this.harvestsService.findById(harvestId)

        if (!harvest) {
            throw new NotFoundException('Harvest not found');
        }

        const crop = await this.cropsService.findById(cropId)

        if (!crop) {
            throw new NotFoundException('Crop not found');
        }

        const propertyCrop = await this.repo.create({
            property: property as Property,
            harvest,
            crop
        })

        return propertyCrop
    }

    async getPropertyById(id: string): Promise<PropertyCrop> {
        if (!id) {
            throw new BadRequestException('Id is required');
        }

        const propertyCrop = await this.repo.findById(id);

        if (!propertyCrop) {
            throw new NotFoundException('Property crop not found');
        }

        return propertyCrop;
    }

    async getAllProperties(): Promise<PropertyCrop[]> {
        const propertyCrops = await this.repo.findAll();

        return propertyCrops;
    }

    async deleteProperty(id: string): Promise<void> {
        if (!id) {
            throw new BadRequestException('Id is required');
        }

        const propertyCrop = await this.repo.findById(id);

        if (!propertyCrop) {
            throw new NotFoundException('Property crop not found');
        }

        await this.repo.delete(id)
    }
}