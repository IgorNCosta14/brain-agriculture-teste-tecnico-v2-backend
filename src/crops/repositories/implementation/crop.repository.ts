import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Crop } from '../../crop.entity';
import { Repository } from 'typeorm';
import { ICropRepository } from '../crop-repository.interface';

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
        return await this.repo.findOne({ where: { id } });
    }

    async findByName(name: string): Promise<Crop | null> {
        return await this.repo.findOne({ where: { name } });
    }

    async findAll(): Promise<Crop[]> {
        return this.repo.find({ order: { name: 'ASC' } });
    }
}