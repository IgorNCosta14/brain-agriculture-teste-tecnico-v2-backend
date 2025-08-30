import { Transform } from "class-transformer";
import { IsNotEmpty, IsUUID } from "class-validator";

export class CreatePropertyCropBodyDto {
    @IsNotEmpty({ message: 'propertyId is required' })
    @IsUUID('4', { message: 'propertyId must be a valid UUID v4' })
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    propertyId: string;

    @IsNotEmpty({ message: 'harvestId is required' })
    @IsUUID('4', { message: 'harvestId must be a valid UUID v4' })
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    harvestId: string;

    @IsNotEmpty({ message: 'cropId is required' })
    @IsUUID('4', { message: 'cropId must be a valid UUID v4' })
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    cropId: string;
}