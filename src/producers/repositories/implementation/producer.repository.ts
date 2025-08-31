import { CreateProducerDto } from "../../dtos/create-producer.dto";
import { Producer } from "../../producer.entity";
import { IProducerRepository } from "../producer-repository.interface";
import { InjectRepository } from "@nestjs/typeorm";
import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { FindAllProducersDto } from "../../dtos/find-all-producers.dto";
import { ProducerOrderByEnum } from "../../enum/producer-order-by.enum";
import { FindAllProducersRespDto } from "../../dtos/find-all-producers-resp.dto";

@Injectable()
export class ProducerRepository implements IProducerRepository {
    constructor(
        @InjectRepository(Producer)
        private readonly repo: Repository<Producer>
    ) { }

    async create({ documentType, document, name }: CreateProducerDto): Promise<Producer> {
        const producer = this.repo.create({
            documentType,
            document,
            name
        })

        return await this.repo.save(producer)
    }

    async update(producer: Producer): Promise<Producer> {
        return await this.repo.save(producer);
    }

    async getById(id: string): Promise<Producer | null> {
        return await this.repo
            .createQueryBuilder('producer')
            .leftJoinAndSelect('producer.properties', 'property')
            .where('producer.id = :id', { id })
            .select([
                'producer.id',
                'producer.documentType',
                'producer.document',
                'producer.name',
                'producer.createdAt',
                'producer.updatedAt',
                'producer.deletedAt',
                'property.id',
                'property.name',
            ])
            .getOne();
    }

    async getByDocument(document: string): Promise<Producer | null> {
        return await this.repo.findOne({
            where: {
                document
            }
        })
    }

    async getAll({
        order = 'DESC',
        page = 1,
        limit = 10,
        orderBy = ProducerOrderByEnum.CREATED_AT,
    }: FindAllProducersDto): Promise<FindAllProducersRespDto> {
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

    async getByName(name: string): Promise<Producer | null> {
        return await this.repo.findOne({
            where: {
                name
            }
        })
    }

    async delete(id: string): Promise<void> {
        await this.repo.softDelete(id)
    }
}