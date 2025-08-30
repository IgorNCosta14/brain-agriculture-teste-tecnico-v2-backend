import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateHarvestDto } from '../../dtos/create-harvest.dto';
import { Harvest } from '../../harvest.entity';
import { Repository } from 'typeorm';
import { HarvestOrderByEnum } from '../../enum/harvest-order-by.enum';
import { FindAllHarvestsRespDto } from '../../dtos/find-all-harvests-resp.dto';
import { FindAllHarvestsDto } from '../../dtos/find-all-harvests.dto';

@Injectable()
export class HarvestRepository {
    constructor(
        @InjectRepository(Harvest)
        private readonly repo: Repository<Harvest>,
    ) { }

    async createHarvest({ label, year, startDate, endDate }: CreateHarvestDto): Promise<Harvest> {
        const harvest = this.repo.create({
            label,
            year,
            startDate,
            endDate
        })

        return await this.repo.save(harvest);
    }

    async updateHarvest(harvest: Harvest): Promise<Harvest> {
        return await this.repo.save(harvest);
    }

    async deleteHarvest(id: string): Promise<void> {
        await this.repo.delete(id);
    }

    async findById(id: string): Promise<Harvest | null> {
        return await this.repo.findOne({ where: { id }, relations: ['propertyCrops'] });
    }

    async findAll({
        order = 'DESC',
        page = 1,
        limit = 10,
        orderBy = HarvestOrderByEnum.YEAR,
    }: FindAllHarvestsDto): Promise<FindAllHarvestsRespDto> {
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
            orderBy,
        };
    }
}
