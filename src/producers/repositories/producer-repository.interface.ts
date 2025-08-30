import { CreateProducerDto } from "../dtos/create-producer.dto";
import { FindAllProducersRespDto } from "../dtos/find-all-producers-resp.dto";
import { FindAllProducersDto } from "../dtos/find-all-producers.dto";
import { Producer } from "../producer.entity";

export interface IProducerRepository {
    create({ documentType, document, name }: CreateProducerDto): Promise<Producer>;
    update(producer: Producer): Promise<Producer>;
    getById(id: string): Promise<Producer | null>;
    getByName(name: string): Promise<Producer | null>;
    getAll({
        order,
        page,
        limit,
        orderBy
    }: FindAllProducersDto): Promise<FindAllProducersRespDto>;
    getByDocument(document: string): Promise<Producer | null>;
    delete(id: string): void;
}