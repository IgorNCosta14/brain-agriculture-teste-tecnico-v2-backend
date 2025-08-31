import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsIn, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { PropertyCropOrderByEnum } from '../enum/property-crop-order-by.enum';

export class PropertyCropsQueryDto {
    @ApiPropertyOptional({
        enum: ['ASC', 'DESC'],
        example: 'DESC',
        description: 'Order direction',
    })
    @IsOptional()
    @IsIn(['ASC', 'DESC', 'asc', 'desc'], { message: 'order must be ASC or DESC' })
    @Transform(({ value }) => value?.toString().trim().toUpperCase())
    order?: 'ASC' | 'DESC' = 'DESC';

    @ApiPropertyOptional({
        enum: PropertyCropOrderByEnum,
        example: PropertyCropOrderByEnum.CREATED_AT,
        description: 'Field used for ordering',
    })
    @IsOptional()
    @IsEnum(PropertyCropOrderByEnum, {
        message: `orderBy must be one of: ${Object.values(PropertyCropOrderByEnum).join(', ')}`,
    })
    orderBy?: PropertyCropOrderByEnum = PropertyCropOrderByEnum.CREATED_AT;

    @ApiPropertyOptional({ example: 1, description: 'Current page (>= 1)' })
    @IsOptional()
    @Transform(({ value }) => Number(value))
    @IsInt({ message: 'page must be an integer' })
    @Min(1, { message: 'page must be >= 1' })
    page?: number = 1;

    @ApiPropertyOptional({ example: 10, description: 'Items per page (1..100)' })
    @IsOptional()
    @Transform(({ value }) => Number(value))
    @IsInt({ message: 'limit must be an integer' })
    @Min(1, { message: 'limit must be >= 1' })
    @Max(100, { message: 'limit must be <= 100' })
    limit?: number = 10;

    @ApiPropertyOptional({ example: 'a4527ea2-915e-4729-ad30-1de710adabbf', description: 'Filter by Property ID' })
    @IsOptional()
    @IsUUID('4', { message: 'propertyId must be a valid UUID v4' })
    propertyId?: string;

    @ApiPropertyOptional({ example: '0f6107bc-2bc0-4125-8c16-b6030df20d4b', description: 'Filter by Harvest ID' })
    @IsOptional()
    @IsUUID('4', { message: 'harvestId must be a valid UUID v4' })
    harvestId?: string;

    @ApiPropertyOptional({ example: '6c6212e8-eff6-48ab-879b-dec77e5c585d', description: 'Filter by Crop ID' })
    @IsOptional()
    @IsUUID('4', { message: 'cropId must be a valid UUID v4' })
    cropId?: string;
}
