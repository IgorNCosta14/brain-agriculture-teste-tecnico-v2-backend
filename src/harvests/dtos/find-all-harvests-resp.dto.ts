import { HarvestOrderByEnum } from '../enum/harvest-order-by.enum';
import { Harvest } from '../harvest.entity';

export class FindAllHarvestsRespDto {
    items: Harvest[];
    total: number;
    totalPages: number;
    page: number;
    limit: number;
    orderBy: HarvestOrderByEnum;
    order: 'ASC' | 'DESC';
}