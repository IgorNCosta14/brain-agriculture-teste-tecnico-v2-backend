import { PropertyOrderByEnum } from '../enum/property-order-by.enum';
import { Property } from '../property.entity';

export class FindAllPropertiesRespDto {
    items: Property[];
    total: number;
    totalPages: number;
    page: number;
    limit: number;
    orderBy: PropertyOrderByEnum;
    order: 'ASC' | 'DESC';
}