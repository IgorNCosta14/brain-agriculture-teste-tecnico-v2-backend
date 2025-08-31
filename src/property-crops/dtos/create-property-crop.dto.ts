import { Crop } from "src/crops/crop.entity";
import { Harvest } from "../../harvests/harvest.entity";
import { Property } from "../../properties/property.entity"

export class CreatePropertyCropDto {
    property: Property;
    harvest: Harvest;
    crop: Crop
}