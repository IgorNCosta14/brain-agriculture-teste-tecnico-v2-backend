import { HarvestOrderByEnum } from "../enum/harvest-order-by.enum";

export class FindAllHarvestsDto {
    order?: 'ASC' | 'DESC';
    page?: number;
    limit?: number;
    orderBy?: HarvestOrderByEnum;
}