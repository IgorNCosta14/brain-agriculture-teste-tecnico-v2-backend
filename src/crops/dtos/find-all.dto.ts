import { CropOrderByEnum } from "../enum/order-by-values.enum";

export class FindAllDto {
    order?: 'ASC' | 'DESC';
    page?: number;
    limit?: number;
    orderBy?: CropOrderByEnum;
}