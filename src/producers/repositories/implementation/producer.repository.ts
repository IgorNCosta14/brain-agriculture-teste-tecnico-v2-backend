import { CreateProducerDto } from "../../dtos/create-producer.dto";
import { Producer } from "../../producer.entity";
import { IProducerRepository } from "../producer-repository.interface";
import { InjectRepository } from "@nestjs/typeorm";
import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";

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
        return await this.repo.findOne({
            where: {
                id
            }
        })
    }

    async getByDocument(document: string): Promise<Producer | null> {
        return await this.repo.findOne({
            where: {
                document
            }
        })
    }

    async getAll(): Promise<Producer[]> {
        return await this.repo.find();
    }

    async getByName(name: string): Promise<Producer | null> {
        return await this.repo.findOne({
            where: {
                name
            }
        })
    }


    async softDelete(id: string): Promise<void> {
        await this.repo.softDelete(id)
    }
}