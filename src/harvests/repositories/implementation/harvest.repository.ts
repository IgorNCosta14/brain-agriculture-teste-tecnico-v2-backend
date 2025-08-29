import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateHarvestDto } from '../../dtos/create-harvest.dto';
import { Harvest } from '../../harvest.entity';
import { Repository } from 'typeorm';

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
        return await this.repo.findOne({ where: { id } });
    }

    async findAll(): Promise<Harvest[]> {
        return await this.repo.find({ order: { year: 'DESC', label: 'ASC' } });
    }
}
