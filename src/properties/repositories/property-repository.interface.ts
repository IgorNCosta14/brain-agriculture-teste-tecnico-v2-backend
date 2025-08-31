import { CreatePropertyDto } from "../dtos/create-property.dto";
import { FindAllPropertiesRespDto } from "../dtos/find-all-properties-resp.dto";
import { FindAllPropertiesDto } from "../dtos/find-all-properties.dto";
import { PropertyOrderByEnum } from "../enum/property-order-by.enum";
import { Property } from "../property.entity";

export interface IPropertyRepository {
    create(data: CreatePropertyDto): Promise<Property>;
    update(property: Property): Promise<Property>;
    delete(id: string): Promise<void>;
    findById(id: string): Promise<Property | null>;
    findAll({
        order,
        page,
        limit,
        orderBy
    }: FindAllPropertiesDto): Promise<FindAllPropertiesRespDto>
}