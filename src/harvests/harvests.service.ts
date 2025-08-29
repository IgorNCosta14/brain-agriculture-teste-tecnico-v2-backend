import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { IHarvestRepository } from "./repositories/harvest-repository.interface";
import { HarvestRepository } from "./repositories/implementation/harvest.repository";
import { CreateHarvestDto } from "./dtos/create-harvest.dto";
import { Harvest } from "./harvest.entity";

@Injectable()
export class HarvestsService {
    constructor(
        @Inject(HarvestRepository)
        private readonly harvestRepository: IHarvestRepository,
    ) { }

    async create({ label, year, startDate, endDate }: CreateHarvestDto): Promise<Harvest> {

        if (endDate < startDate) {
            throw new BadRequestException('End date must be on or after start date');
        }

        return this.harvestRepository.createHarvest({ label, year, startDate, endDate });
    }

    async findById(id: string): Promise<Harvest> {
        const harvest = await this.harvestRepository.findById(id);

        if (!harvest) {
            throw new NotFoundException('Harvest not found');
        }

        return harvest;
    }

    async findAll(): Promise<Partial<Harvest>[]> {
        const harvests = await this.harvestRepository.findAll();

        return harvests.map(({
            id,
            label,
            year,
            startDate,
            endDate
        }) => {
            return {
                id,
                label,
                year,
                startDate,
                endDate
            }
        })
    }
}