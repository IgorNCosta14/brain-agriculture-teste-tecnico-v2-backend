import { Injectable, ConflictException, NotFoundException, Inject } from '@nestjs/common';
import type { ICropRepository } from './repositories/crop-repository.interface';
import { Crop } from './crop.entity';
import { CropRepository } from './repositories/implementation/crop.repository';

@Injectable()
export class CropsService {
    constructor(
        @Inject(CropRepository)
        private readonly cropRepository: ICropRepository
    ) { }

    async create(name: string): Promise<Crop> {
        if (!name) {
            throw new ConflictException('Crop name must not be empty');
        }

        const alreadyExists = await this.cropRepository.findByName(name)

        if (alreadyExists) {
            throw new ConflictException('Crop with this name already exists');
        }

        return this.cropRepository.createCrop(name);
    }

    async findById(id: string): Promise<Crop> {
        const crop = await this.cropRepository.findById(id);

        if (!crop) {
            throw new NotFoundException('Crop not found');
        }

        return crop;
    }

    async findAll(): Promise<{ id: string; name: string }[]> {
        const crops = await this.cropRepository.findAll();

        return crops.map(({ id, name }) => ({
            id, name
        }));
    }
}
