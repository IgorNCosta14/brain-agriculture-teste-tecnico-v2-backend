import { CreatePropertyCropDto } from "../dtos/create-property-crop.dto";
import { FindAllPropertyCropsRespDto } from "../dtos/find-all-property-crops-resp.dto";
import { FindAllPropertyCropsDto } from "../dtos/find-all-property-crops.dto";
import { PropertyCrop } from "../property-crop.entity";

export interface IPropertycropRepository {
    create(data: CreatePropertyCropDto): Promise<PropertyCrop>;
    findById(id: string): Promise<PropertyCrop | null>;
    findAll({
        order,
        page,
        limit,
        orderBy,
        propertyId,
        harvestId,
        cropId,
    }: FindAllPropertyCropsDto): Promise<FindAllPropertyCropsRespDto>
    delete(id: string): Promise<void>;
}