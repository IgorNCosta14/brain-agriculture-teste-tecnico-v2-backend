import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { ProducerRepository } from "./repositories/implementation/producer.repository";
import type { IProducerRepository } from "./repositories/producer-repository.interface";
import { Producer } from "./producer.entity";
import { DocumentValidator } from "../utils/document-validator.util";
import { CreateProducerBodyDto } from "./dtos/create-producer-body.dto";
import { UpdateProducerDto } from "./dtos/update-producer.dto";

@Injectable()
export class ProducersService {
    constructor(
        @Inject(ProducerRepository)
        private readonly repo: IProducerRepository
    ) { }


    async createProducer({ document, name }: CreateProducerBodyDto): Promise<Partial<Producer>> {
        const producerNameExists = await this.repo.getByName(name);

        if (producerNameExists) {
            throw new BadRequestException('Producer name already exists');
        }

        const producerDocumentExists = await this.repo.getByDocument(document);

        if (producerDocumentExists) {
            throw new BadRequestException('Producer document already exists');
        }

        const producer = await this.repo.create({
            documentType: DocumentValidator.validate(document),
            document,
            name
        })

        return {
            id: producer.id,
            name: producer.name
        };
    }

    async deleteProducer(id: string): Promise<void> {
        if (!id) {
            throw new BadRequestException("Id is required!")
        }

        const producer = await this.repo.getById(id);

        if (!producer) {
            throw new NotFoundException("Producer not found!")
        }

        await this.repo.delete(id);
    }

    async updateProducer({ id, document, name }: UpdateProducerDto): Promise<Producer> {
        if (!id) {
            throw new BadRequestException("Id is required!")
        }

        const producer = await this.repo.getById(id);

        if (!producer) {
            throw new NotFoundException("Producer not found!")
        }

        if (document && producer.document !== document) {
            const producerDocumentExists = await this.repo.getByDocument(document);

            if (producerDocumentExists) {
                throw new BadRequestException('Producer document already exists');
            }

            producer.document = document;
            producer.documentType = DocumentValidator.validate(document)
        }

        if (name && producer.name !== name) {
            const producerNameExists = await this.repo.getByName(name);

            if (producerNameExists) {
                throw new BadRequestException('Producer name already exists');
            }

            producer.name = name;
        }

        return await this.repo.update(producer);
    }

    async getAllProducers(): Promise<Partial<Producer>[]> {
        const producers = await this.repo.getAll();

        return producers.map((producer) => {
            return {
                id: producer.id,
                name: producer.name
            }
        })
    }

    async findProducerById(id: string): Promise<Producer> {
        if (!id) {
            throw new BadRequestException("Id is required!")
        }

        const producer = await this.repo.getById(id);

        if (!producer) {
            throw new NotFoundException("Producer not found!")
        }

        return producer;
    }
}