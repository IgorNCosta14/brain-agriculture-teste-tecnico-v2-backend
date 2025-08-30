import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { PropertyOrderByEnum } from 'src/properties/enum/property-order-by.enum';

export class PropertiesQueryDto {
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
        enum: PropertyOrderByEnum,
        example: PropertyOrderByEnum.CREATED_AT,
        description: 'Field used for ordering',
    })
    @IsOptional()
    @IsEnum(PropertyOrderByEnum, {
        message: `orderBy must be one of: ${Object.values(PropertyOrderByEnum).join(', ')}`,
    })
    orderBy?: PropertyOrderByEnum = PropertyOrderByEnum.CREATED_AT;

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
}
