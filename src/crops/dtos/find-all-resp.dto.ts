import { Crop } from "../crop.entity";
import { CropOrderByEnum } from "../enum/order-by-values.enum";

export class FindAllRespDto {
    items: Crop[];
    total: number;
    totalPages: number;
    page: number;
    limit: number;
    orderBy: CropOrderByEnum;
    order: 'ASC' | 'DESC';
}