import { PropertyOrderByEnum } from "../enum/property-order-by.enum";

export class FindAllPropertiesDto {
    order?: 'ASC' | 'DESC';
    page?: number;
    limit?: number;
    orderBy?: PropertyOrderByEnum;
}