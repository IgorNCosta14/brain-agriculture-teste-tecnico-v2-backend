import { ProducerOrderByEnum } from "../enum/producer-order-by.enum";

export class FindAllProducersDto {
    order?: 'ASC' | 'DESC';
    page?: number;
    limit?: number;
    orderBy?: ProducerOrderByEnum;
}