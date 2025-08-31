import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEnum, IsIn, IsInt, IsOptional, Max, Min } from "class-validator";
import { CropOrderByEnum } from "../enum/order-by-values.enum";

export class CropsQueryDto {
    @ApiPropertyOptional({ enum: ['ASC', 'DESC'], example: 'ASC', description: 'Ordenação por nome' })
    @IsOptional()
    @IsIn(['ASC', 'DESC', 'asc', 'desc'], { message: 'order must be ASC or DESC' })
    @Transform(({ value }) => value?.toString().trim().toUpperCase())
    order?: 'ASC' | 'DESC' = 'ASC';

    @ApiPropertyOptional({
        enum: CropOrderByEnum,
        example: CropOrderByEnum.NAME,
        description: 'Campo usado para ordenação',
    })
    @IsOptional()
    @IsEnum(CropOrderByEnum, { message: `orderBy must be one of: ${Object.values(CropOrderByEnum).join(', ')}` })
    orderBy?: CropOrderByEnum = CropOrderByEnum.NAME;

    @ApiPropertyOptional({ example: 1, description: 'Página atual (>= 1)' })
    @IsOptional()
    @Transform(({ value }) => Number(value))
    @IsInt({ message: 'page must be an integer' })
    @Min(1, { message: 'page must be >= 1' })
    page?: number = 1;

    @ApiPropertyOptional({ example: 10, description: 'Itens por página (1..100)' })
    @IsOptional()
    @Transform(({ value }) => Number(value))
    @IsInt({ message: 'limit must be an integer' })
    @Min(1, { message: 'limit must be >= 1' })
    @Max(100, { message: 'limit must be <= 100' })
    limit?: number = 10;
}