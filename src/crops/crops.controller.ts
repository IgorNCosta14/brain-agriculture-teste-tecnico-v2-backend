import { Body, Controller, Get, HttpStatus, Post, Param, Query } from '@nestjs/common';
import { CropsService } from './crops.service';
import { CreateCropBodyDto } from './dtos/create-crop-body.dto';
import { CropIdParamsDto } from './dtos/crop-id-params.dto';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CropsQueryDto } from './dtos/crops-query.dto';
import { CropOrderByEnum } from './enum/order-by-values.enum';

@ApiTags('Crops')
@Controller('crops')
export class CropsController {
    constructor(
        private readonly service: CropsService
    ) { }

    @Post('/')
    @ApiOperation({
        summary: 'Criar uma nova cultura',
        description:
            'Cria uma nova cultura (crop) com um nome único. O nome não pode ser vazio e não deve já existir no banco de dados.',
    })
    @ApiBody({
        description: 'Dados necessários para criar uma cultura',
        examples: {
            valid: {
                summary: 'Requisição válida',
                value: { name: 'Soja' },
            }
        },
    })
    @ApiResponse({
        status: 201,
        description: 'Cultura criada com sucesso',
        schema: {
            example: {
                statusCode: 201,
                message: 'Crop successfully created',
                data: {
                    crop: {
                        id: 'e3a6d1e0-4f1f-4b47-9af0-3cbd9e6f5a10',
                        name: 'Soja',
                        createdAt: '2025-08-28T12:34:56.789Z',
                    },
                },
            },
        },
    })
    @ApiResponse({
        status: 409,
        description: 'Conflito: a cultura já existe ou o nome está vazio',
        content: {
            'application/json': {
                examples: {
                    emptyName: {
                        summary: 'Nome vazio',
                        value: {
                            statusCode: 409,
                            message: 'Crop name must not be empty',
                            error: 'Conflict',
                        },
                    },
                    duplicateName: {
                        summary: 'Nome já existente',
                        value: {
                            statusCode: 409,
                            message: 'Crop with this name already exists',
                            error: 'Conflict',
                        },
                    },
                },
            },
        },
    })
    async createCrop(
        @Body() { name }: CreateCropBodyDto
    ) {
        const crop = await this.service.create(name);

        return {
            statusCode: HttpStatus.CREATED,
            message: 'Crop successfully created',
            data: { crop },
        };
    }

    @Get('/')
    @ApiOperation({
        summary: 'Listar todas as culturas',
        description: 'Retorna a lista de todas as culturas cadastradas com suporte a paginação e ordenação.',
    })
    @ApiResponse({
        status: 200,
        description: 'Culturas retornadas com sucesso',
        schema: {
            example: {
                statusCode: 200,
                message: 'Crops successfully retrieved',
                data: {
                    crops: [
                        {
                            id: 'e3a6d1e0-4f1f-4b47-9af0-3cbd9e6f5a10',
                            name: 'Milho',
                        },
                        {
                            id: 'b2c4a8d5-9e77-41a1-873a-1baf4d9b7e11',
                            name: 'Soja',
                        },
                        {
                            id: 'c8d7e6f9-3a1b-45f2-94ce-6d7f9a1b2c3d',
                            name: 'Café',
                        },
                    ],
                },
                meta: {
                    page: 1,
                    limit: 10,
                    total: 3,
                    totalPages: 1,
                    order: 'ASC',
                    orderBy: 'name',
                },
            },
        },
    })
    @ApiQuery({
        name: 'order',
        required: false,
        enum: ['ASC', 'DESC'],
        description: 'Direção da ordenação (padrão: ASC)',
        example: 'ASC',
    })
    @ApiQuery({
        name: 'orderBy',
        required: false,
        enum: Object.values(CropOrderByEnum),
        description: 'Campo usado para ordenação (padrão: name)',
        example: 'name',
    })
    @ApiQuery({
        name: 'page',
        required: false,
        type: Number,
        description: 'Número da página para paginação (padrão: 1)',
        example: 1,
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Quantidade de itens por página (padrão: 10, máximo: 100)',
        example: 10,
    })
    async findCrops(
        @Query() { order, page, limit, orderBy }: CropsQueryDto
    ) {
        const crops = await this.service.findCrops({
            order,
            page,
            limit,
            orderBy
        });

        return {
            statusCode: HttpStatus.OK,
            message: 'Crops successfully retrieved',
            data: { crops },
        };
    }

    @Get('/:id')
    @ApiOperation({
        summary: 'Buscar cultura por ID',
        description:
            'Retorna uma cultura específica pelo seu identificador (UUID). Caso não exista, retorna 404.',
    })
    @ApiResponse({
        status: 200,
        description: 'Crop successfully retrieved',
        schema: {
            example: {
                statusCode: 200,
                message: 'Crop successfully retrieved',
                data: {
                    crop: {
                        id: '6c6212e8-eff6-48ab-879b-dec77e5c585d',
                        name: 'Milho',
                        propertyCrops: [
                            {
                                id: '841a07b8-5eae-4c99-b60f-c02e03df4a6b',
                                createdAt: '2025-08-30T09:51:38.909Z',
                                updatedAt: '2025-08-30T09:51:38.909Z',
                                deletedAt: null,
                            },
                        ],
                        createdAt: '2025-08-28T22:57:02.968Z',
                    },
                },
            },
        },
    })
    @ApiResponse({
        status: 404,
        description: 'Crop not found',
        content: {
            'application/json': {
                example: {
                    statusCode: 404,
                    message: 'Crop not found',
                    error: 'Not Found',
                },
            },
        },
    })
    async findCropById(
        @Param() { id }: CropIdParamsDto
    ) {
        const crop = await this.service.findById(id);

        return {
            statusCode: HttpStatus.OK,
            message: 'Crop successfully retrieved',
            data: { crop },
        };
    }
}
