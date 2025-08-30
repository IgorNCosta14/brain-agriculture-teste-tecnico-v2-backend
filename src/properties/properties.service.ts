import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { PropertyRepository } from "./repositories/implementation/property.repository";
import type { IPropertyRepository } from "./repositories/property-repository.interface";
import { Property } from "./property.entity";
import { ProducersService } from "../producers/producers.service";
import { AreaValidate } from "../utils/area-validate.util";
import { CreatePropertyServiceDto } from "./dtos/create-property-service.dto";
import { UpdatePropertyDto } from "./dtos/update-property.dto";
import { FindAllPropertiesDto } from "./dtos/find-all-properties.dto";
import { FindAllPropertiesRespDto } from "./dtos/find-all-properties-resp.dto";

@Injectable()
export class PropertiesService {
    constructor(
        @Inject(PropertyRepository)
        private readonly repo: IPropertyRepository,
        private readonly producersService: ProducersService
    ) { }

    async createPorperty({
        producerId,
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
    }: CreatePropertyServiceDto): Promise<Partial<Property>> {
        if (arableAreaHa + vegetationAreaHa > totalAreaHa) {
            throw new BadRequestException(
                'The sum of arable area and vegetation area cannot exceed the total area'
            );
        }

        const producer = await this.producersService.findProducerById(producerId);

        const property = await this.repo.create({
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
        })

        return {
            id: property.id,
            name: property.name
        }
    }

    async updateProperty(
        {
            id,
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
        }: UpdatePropertyDto
    ): Promise<Partial<Property>> {
        const current = await this.repo.findById(id);

        if (!current) {
            throw new NotFoundException('Property not found');
        }

        const next = {
            ...current,
            name: name ?? current.name,
            city: city ?? current.city,
            state: state ?? current.state,
            totalAreaHa: totalAreaHa ?? current.totalAreaHa,
            arableAreaHa: arableAreaHa ?? current.arableAreaHa,
            vegetationAreaHa: vegetationAreaHa ?? current.vegetationAreaHa,
            complement: complement === undefined ? current.complement ?? null : complement,
            latitude: latitude === undefined ? (current.latitude ?? null) : latitude,
            longitude: longitude === undefined ? (current.longitude ?? null) : longitude,
            cep: cep === undefined ? (current.cep ?? null) : cep,
        } as Property;

        AreaValidate.validateAreas(next.totalAreaHa, next.arableAreaHa, next.vegetationAreaHa);

        const saved = await this.repo.update(next);

        return {
            id: saved.id,
            name: saved.name,
            city: saved.city,
            state: saved.state,
            totalAreaHa: saved.totalAreaHa,
            arableAreaHa: saved.arableAreaHa,
            vegetationAreaHa: saved.vegetationAreaHa,
            complement: saved.complement ?? null,
            latitude: saved.latitude ?? null,
            longitude: saved.longitude ?? null,
            cep: saved.cep ?? null,
            updatedAt: saved.updatedAt,
        };
    }

    async getPropertyById(id: string): Promise<Partial<Property>> {
        if (!id) {
            throw new BadRequestException("Id is required");
        }

        const property = await this.repo.findById(id);

        if (!property) {
            throw new NotFoundException("Property not found");
        }

        return property;
    }

    async getProperty({
        order,
        page,
        limit,
        orderBy
    }: FindAllPropertiesDto): Promise<FindAllPropertiesRespDto> {
        return await this.repo.findAll({
            order,
            page,
            limit,
            orderBy
        });
    }

    async deleteProperty(id: string): Promise<void> {
        if (!id) {
            throw new BadRequestException("Id is required");
        }

        const property = await this.repo.findById(id);

        if (!property) {
            throw new NotFoundException("Property not found");
        }

        await this.repo.delete(id);
    }
}