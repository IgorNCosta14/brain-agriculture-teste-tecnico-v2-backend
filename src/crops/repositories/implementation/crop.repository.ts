import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Crop } from '../../crop.entity';
import { Repository } from 'typeorm';
import { ICropRepository } from '../crop-repository.interface';
import { FindAllDto } from '../../dtos/find-all.dto';
import { FindAllRespDto } from '../../dtos/find-all-resp.dto';
import { CropOrderByEnum } from '../../enum/order-by-values.enum';

@Injectable()
export class CropRepository implements ICropRepository {
    constructor(
        @InjectRepository(Crop)
        private readonly repo: Repository<Crop>,
    ) { }

    async createCrop(name: string): Promise<Crop> {
        const crop = this.repo.create({ name });

        return await this.repo.save(crop);
    }

    async findById(id: string): Promise<Crop | null> {
        return await this.repo.findOne({ where: { id }, relations: ['propertyCrops'] });
    }

    async findByName(name: string): Promise<Crop | null> {
        return await this.repo.findOne({ where: { name } });
    }

    async findAll({
        order = 'ASC',
        page = 1,
        limit = 10,
        orderBy = CropOrderByEnum.NAME
    }: FindAllDto): Promise<FindAllRespDto> {
        const [items, total] = await this.repo.findAndCount({
            order: { [orderBy]: order },
            skip: (page - 1) * limit,
            take: limit,
        });

        return {
            items,
            total,
            totalPages: Math.ceil(total / limit),
            page,
            limit,
            order,
            orderBy
        };
    }

}