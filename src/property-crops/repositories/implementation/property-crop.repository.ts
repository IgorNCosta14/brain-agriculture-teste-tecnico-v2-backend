import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { IPropertycropRepository } from "../property-crop-repository.interface";
import { Injectable } from "@nestjs/common";
import { PropertyCrop } from "../../property-crop.entity";
import { CreatePropertyCropDto } from "../../dtos/create-property-crop.dto";
import { PropertyCropOrderByEnum } from "../../enum/property-crop-order-by.enum";
import { FindAllPropertyCropsDto } from "../../dtos/find-all-property-crops.dto";
import { FindAllPropertyCropsRespDto } from "../../dtos/find-all-property-crops-resp.dto";

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

    async findAll({
        order = 'DESC',
        page = 1,
        limit = 10,
        orderBy = PropertyCropOrderByEnum.CREATED_AT,
        propertyId,
        harvestId,
        cropId,
    }: FindAllPropertyCropsDto): Promise<FindAllPropertyCropsRespDto> {
        const safePage = Math.max(1, Number(page) || 1);
        const safeLimit = Math.min(100, Math.max(1, Number(limit) || 10));

        const qb = this.repo
            .createQueryBuilder('pc')
            .leftJoinAndSelect('pc.property', 'property')
            .leftJoinAndSelect('pc.harvest', 'harvest')
            .leftJoinAndSelect('pc.crop', 'crop');

        if (propertyId) {
            qb.andWhere('property.id = :propertyId', { propertyId });
        }
        if (harvestId) {
            qb.andWhere('harvest.id = :harvestId', { harvestId });
        }
        if (cropId) {
            qb.andWhere('crop.id = :cropId', { cropId });
        }

        const orderColumnMap: Record<PropertyCropOrderByEnum, string> = {
            [PropertyCropOrderByEnum.CREATED_AT]: 'pc.created_at',
        };

        const orderColumn = orderColumnMap[orderBy] ?? 'pc.created_at';

        qb.orderBy(orderColumn, order === 'ASC' ? 'ASC' : 'DESC')
            .skip((safePage - 1) * safeLimit)
            .take(safeLimit);

        const [items, total] = await qb.getManyAndCount();

        return {
            items,
            total,
            totalPages: Math.ceil(total / safeLimit),
            page: safePage,
            limit: safeLimit,
            order,
            orderBy,
        };
    }

    async delete(id: string): Promise<void> {
        await this.repo.softDelete(id);
    }
}