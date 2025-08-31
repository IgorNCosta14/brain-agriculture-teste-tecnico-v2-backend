import { PropertyCropOrderByEnum } from '../enum/property-crop-order-by.enum';
import { PropertyCrop } from '../property-crop.entity';

export class FindAllPropertyCropsRespDto {
    items: PropertyCrop[];
    total: number;
    totalPages: number;
    page: number;
    limit: number;
    orderBy: PropertyCropOrderByEnum;
    order: 'ASC' | 'DESC';
}