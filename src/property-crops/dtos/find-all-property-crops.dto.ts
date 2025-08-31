import { PropertyCropOrderByEnum } from "../enum/property-crop-order-by.enum";

export class FindAllPropertyCropsDto {
    order?: 'ASC' | 'DESC';
    page?: number;
    limit?: number;
    orderBy?: PropertyCropOrderByEnum;
    propertyId?: string;
    harvestId?: string;
    cropId?: string;
}