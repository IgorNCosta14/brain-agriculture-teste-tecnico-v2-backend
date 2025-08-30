import { CreateProducerDto } from "../dtos/create-producer.dto";
import { Producer } from "../producer.entity";

export interface IProducerRepository {
    create({ documentType, document, name }: CreateProducerDto): Promise<Producer>;
    update(producer: Producer): Promise<Producer>;
    getById(id: string): Promise<Producer | null>;
    getByName(name: string): Promise<Producer | null>;
    getAll(): Promise<Producer[]>;
    getByDocument(document: string): Promise<Producer | null>;
    delete(id: string): void;
}