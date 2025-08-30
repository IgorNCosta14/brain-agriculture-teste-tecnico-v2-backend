import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { IReportsReadRepository, PieItem } from '../reports-read-repository.interface';
import { Property } from '../../../properties/property.entity';
import { PropertyCrop } from '../../../property-crops/property-crop.entity';

@Injectable()
export class ReportsReadRepository implements IReportsReadRepository {
    constructor(
        @InjectRepository(Property)
        private readonly properties: Repository<Property>,

        @InjectRepository(PropertyCrop)
        private readonly propertyCrops: Repository<PropertyCrop>
    ) { }

    async totalFarms(): Promise<number> {
        const row = await this.properties
            .createQueryBuilder('p')
            .select('COUNT(*)::int', 'value')
            .where('p.deletedAt IS NULL')
            .getRawOne<{ value: number }>();

        return row?.value ?? 0;
    }

    async totalHectares(): Promise<string> {
        const row = await this.properties
            .createQueryBuilder('p')
            .select('COALESCE(SUM(p.totalAreaHa), 0)::numeric', 'value')
            .where('p.deletedAt IS NULL')
            .getRawOne<{ value: string }>();

        return row?.value ?? '0';
    }

    async farmsByState(): Promise<PieItem[]> {
        return this.properties
            .createQueryBuilder('p')
            .select('p.state', 'label')
            .addSelect('COUNT(*)::int', 'value')
            .where('p.deletedAt IS NULL')
            .groupBy('p.state')
            .orderBy('value', 'DESC')
            .addOrderBy('label', 'ASC')
            .getRawMany<PieItem>();
    }

    async farmsByCrop(): Promise<PieItem[]> {
        return this.propertyCrops
            .createQueryBuilder('pc')
            .innerJoin('pc.crop', 'c')
            .innerJoin('pc.property', 'p')
            .select('c.name', 'label')
            .addSelect('COUNT(DISTINCT p.id)::int', 'value')
            .where('p.deletedAt IS NULL')
            .andWhere('pc.deletedAt IS NULL')
            .groupBy('c.name')
            .orderBy('value', 'DESC')
            .addOrderBy('label', 'ASC')
            .getRawMany<PieItem>();
    }

    async landUse(): Promise<PieItem[]> {
        const row = await this.properties
            .createQueryBuilder('p')
            .select('COALESCE(SUM(p.arableAreaHa), 0)::numeric', 'agricultural')
            .addSelect('COALESCE(SUM(p.vegetationAreaHa), 0)::numeric', 'vegetation')
            .where('p.deletedAt IS NULL')
            .getRawOne<{ agricultural: string; vegetation: string }>();

        return [
            { label: 'Agricultural', value: row?.agricultural ?? '0' },
            { label: 'Vegetation', value: row?.vegetation ?? '0' },
        ];
    }
}