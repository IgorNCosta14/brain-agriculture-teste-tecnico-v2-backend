import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Property } from '../../property.entity';
import { Repository } from 'typeorm';
import { IPropertyRepository } from '../property-repository.interface';
import { CreatePropertyDto } from '../../dtos/create-property.dto';

@Injectable()
export class PropertyRepository implements IPropertyRepository {
    constructor(
        @InjectRepository(Property)
        private readonly repo: Repository<Property>,
    ) { }

    async create({
        producer,
        name,
        city,
        state,
        totalAreaHa,
        arableAreaHa,
        vegetationAreaHa,
        complement,
        latitude,
        longitude,
        cep
    }: CreatePropertyDto): Promise<Property> {
        const property = this.repo.create({
            producer,
            name,
            city,
            state,
            totalAreaHa,
            arableAreaHa,
            vegetationAreaHa,
            cep,
            complement,
            latitude,
            longitude
        })

        return await this.repo.save(property)
    }

    async update(property: Property): Promise<Property> {
        return await this.repo.save(property)
    }

    async delete(id: string): Promise<void> {
        await this.repo.softDelete(id);
    }

    async findById(id: string): Promise<Property | null> {
        return await this.repo.findOne({
            where: {
                id
            }
        })
    }

    async findAll(): Promise<Property[]> {
        return await this.repo.find();
    }
}
