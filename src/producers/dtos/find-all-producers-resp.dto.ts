import { ProducerOrderByEnum } from '../enum/producer-order-by.enum';
import { Producer } from '../producer.entity';

export class FindAllProducersRespDto {
    items: Producer[];
    total: number;
    totalPages: number;
    page: number;
    limit: number;
    orderBy: ProducerOrderByEnum;
    order: 'ASC' | 'DESC';
}