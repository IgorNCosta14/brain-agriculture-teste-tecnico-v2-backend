import { CreatePropertyCropDto } from "../dtos/create-property-crop.dto";
import { PropertyCrop } from "../property-crop.entity";

export interface IPropertycropRepository {
    create(data: CreatePropertyCropDto): Promise<PropertyCrop>;
    findById(id: string): Promise<PropertyCrop | null>;
    findAll(): Promise<PropertyCrop[]>;
    delete(id: string): Promise<void>
}