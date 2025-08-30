import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { IPropertycropRepository } from "../property-crop-repository.interface";
import { Injectable } from "@nestjs/common";
import { PropertyCrop } from "../../property-crop.entity";
import { CreatePropertyCropDto } from "../../dtos/create-property-crop.dto";

@Injectable()
export class PropertyCropRepository implements IPropertycropRepository {
    constructor(
        @InjectRepository(PropertyCrop)
        private readonly repo: Repository<PropertyCrop>
    ) { }

    async create({
        property,
        harvest,
        crop
    }: CreatePropertyCropDto): Promise<PropertyCrop> {
        const propertyCrop = this.repo.create({
            property,
            harvest,
            crop
        });

        return await this.repo.save(propertyCrop);
    }

    async findById(id: string): Promise<PropertyCrop | null> {
        return await this.repo.findOne({
            where: {
                id
            },
            relations: ['property', 'harvest', 'crop']
        });
    }

    async findAll(): Promise<PropertyCrop[]> {
        return await this.repo.find({
            relations: ['property', 'harvest', 'crop']
        });
    }

    async delete(id: string): Promise<void> {
        await this.repo.softDelete(id);
    }
}