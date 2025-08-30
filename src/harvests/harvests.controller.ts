import { Body, Controller, Get, HttpStatus, Param, Post, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiNotFoundResponse, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HarvestsService } from './harvests.service';
import { CreateHarvestBodyDto } from './dtos/create-harvest-body.dto';
import { HarvestIdParamsDto } from './dtos/harvest-id-params.dto';
import { HarvestOrderByEnum } from './enum/harvest-order-by.enum';
import { HarvestsQueryDto } from './dtos/harvests-query.dto';

@ApiTags('Harvests')
@Controller('harvests')
export class HarvestsController {
    constructor(private readonly service: HarvestsService) { }

    @Post('/')
    @ApiOperation({
        summary: 'Criar uma nova safra (harvest)',
        description:
            'Cria uma nova safra com label, ano, data de início e data de término. A data de término deve ser igual ou posterior à data de início.',
    })
    @ApiBody({
        description: 'Dados necessários para criar uma safra',
        examples: {
            valid: {
                summary: 'Requisição válida (YYYY-MM-DD)',
                value: {
                    label: 'Safra 2025',
                    year: 2025,
                    startDate: '2025-01-01',
                    endDate: '2025-12-31',
                },
            },
            validBrazilian: {
                summary: 'Requisição válida com datas DD/MM/YYYY (serão normalizadas)',
                value: {
                    label: 'Safra 2025',
                    year: 2025,
                    startDate: '01/01/2025',
                    endDate: '31/12/2025',
                },
            },
        },
    })
    @ApiResponse({
        status: 201,
        description: 'Safra criada com sucesso',
        schema: {
            example: {
                statusCode: 201,
                message: 'Harvest successfully created',
                data: {
                    harvest: {
                        id: '2f8f4a19-6c4d-4d7e-9e2c-7d1a9e9f0b12',
                        label: 'Safra 2025',
                        year: 2025,
                        startDate: '2025-01-01',
                        endDate: '2025-12-31',
                        createdAt: '2025-08-28T12:34:56.789Z',
                    },
                },
            },
        },
    })
    @ApiResponse({
        status: 400,
        description: 'Requisição inválida (por exemplo, endDate antes de startDate)',
        content: {
            'application/json': {
                examples: {
                    endBeforeStart: {
                        summary: 'endDate anterior a startDate',
                        value: {
                            statusCode: 400,
                            message: 'End date must be on or after start date',
                            error: 'Bad Request',
                        },
                    },
                    invalidDateFormat: {
                        summary: 'Formato de data inválido',
                        value: {
                            statusCode: 400,
                            message: 'startDate must be a valid date in YYYY-MM-DD format',
                            error: 'Bad Request',
                        },
                    },
                },
            },
        },
    })
    async createHarvest(
        @Body() { label, year, startDate, endDate }: CreateHarvestBodyDto
    ) {
        const harvest = await this.service.create({
            label,
            year,
            startDate,
            endDate
        });

        return {
            statusCode: HttpStatus.CREATED,
            message: 'Harvest successfully created',
            data: { harvest },
        };
    }

    @Get('/')
    @ApiOperation({
        summary: 'Listar todas as safras',
        description:
            'Retorna a lista de safras com suporte a paginação e ordenação (ASC/DESC, por ano, rótulo ou data de criação).',
    })
    @ApiResponse({
        status: 200,
        description: 'Safras retornadas com sucesso',
        schema: {
            example: {
                statusCode: 200,
                message: 'Harvests successfully retrieved',
                data: {
                    harvests: [
                        {
                            id: '7d7a6a8e-1b2c-4d5e-9f01-23456789abcd',
                            label: 'Safra 2024/2025',
                            year: 2025,
                            startDate: '2024-09-01',
                            endDate: '2025-08-31',
                        },
                        {
                            id: '1a2b3c4d-5e6f-7081-92a3-b4c5d6e7f809',
                            label: 'Safra 2023/2024',
                            year: 2024,
                            startDate: '2023-09-01',
                            endDate: '2024-08-31',
                        },
                    ],
                },
                meta: {
                    page: 1,
                    limit: 10,
                    total: 2,
                    totalPages: 1,
                    order: 'DESC',
                    orderBy: 'year',
                },
            },
        },
    })
    @ApiQuery({
        name: 'order',
        required: false,
        enum: ['ASC', 'DESC'],
        description: 'Direção da ordenação (padrão: DESC)',
        example: 'DESC',
    })
    @ApiQuery({
        name: 'orderBy',
        required: false,
        enum: HarvestOrderByEnum,
        description: 'Campo de ordenação (padrão: year)',
        example: HarvestOrderByEnum.YEAR,
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
    async findAllHarvests(
        @Query() { order, orderBy, page, limit }: HarvestsQueryDto,
    ) {
        const result = await this.service.findHarvests({ order, orderBy, page, limit });

        return {
            statusCode: HttpStatus.OK,
            message: 'Harvests successfully retrieved',
            data: { harvests: result.items },
            meta: result,
        };
    }

    @Get('/:id')
    @ApiOperation({
        summary: 'Buscar safra por ID',
        description:
            'Retorna os detalhes de uma safra específica a partir do seu identificador (UUID v4).',
    })
    @ApiParam({
        name: 'id',
        required: true,
        description: 'Identificador da safra (UUID v4)',
        example: '0f6107bc-2bc0-4125-8c16-b6030df20d4b',
    })
    @ApiResponse({
        status: 200,
        description: 'Safra retornada com sucesso',
        schema: {
            example: {
                statusCode: 200,
                message: 'Harvest successfully retrieved',
                data: {
                    harvest: {
                        id: '0f6107bc-2bc0-4125-8c16-b6030df20d4b',
                        label: '2ª Safra 2025',
                        year: 2025,
                        startDate: '2025-01-29',
                        endDate: '2025-04-30',
                        propertyCrops: [
                            {
                                id: '841a07b8-5eae-4c99-b60f-c02e03df4a6b',
                                createdAt: '2025-08-30T09:51:38.909Z',
                                updatedAt: '2025-08-30T09:51:38.909Z',
                                deletedAt: null,
                            },
                        ],
                        createdAt: '2025-08-29T16:19:34.118Z',
                        updatedAt: '2025-08-29T16:19:34.118Z',
                    },
                },
            },
        },
    })
    @ApiBadRequestResponse({
        description: 'Parâmetro inválido (ex.: UUID mal formatado)',
        schema: {
            example: {
                statusCode: 400,
                message: [
                    'Id must be provided in params',
                    'Id must be a valid UUID (version 4), it should be provided in params',
                ],
                error: 'Bad Request',
            },
        },
    })
    @ApiNotFoundResponse({
        description: 'Safra não encontrada',
        schema: {
            example: {
                statusCode: 404,
                message: 'Harvest not found',
                error: 'Not Found',
            },
        },
    })
    async findHarvestById(
        @Param() { id }: HarvestIdParamsDto
    ) {
        const harvest = await this.service.findById(id);

        return {
            statusCode: HttpStatus.OK,
            message: 'Harvest successfully retrieved',
            data: { harvest },
        };
    }
}
