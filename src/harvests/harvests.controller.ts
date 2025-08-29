import { Body, Controller, Get, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HarvestsService } from './harvests.service';
import { CreateHarvestBodyDto } from './dtos/create-harvest-body.dto';
import { HarvestIdParamsDto } from './dtos/harvest-id-params.dto';

@ApiTags('harvests')
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
            'Retorna a lista de todas as safras cadastradas, ordenadas por ano (desc) e label (asc).',
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
                            id: 'a1',
                            label: 'Safra 2025',
                            year: 2025,
                            startDate: '2025-01-01',
                            endDate: '2025-12-31',
                        },
                        {
                            id: 'b2',
                            label: 'Safra 2024',
                            year: 2024,
                            startDate: '2024-01-01',
                            endDate: '2024-12-31',
                        },
                    ],
                },
            },
        },
    })
    async findAllHarvests() {
        const harvests = await this.service.findAll();

        return {
            statusCode: HttpStatus.OK,
            message: 'Harvests successfully retrieved',
            data: { harvests },
        };
    }

    @Get('/:id')
    @ApiOperation({
        summary: 'Buscar safra por ID',
        description:
            'Retorna uma safra específica pelo seu identificador (UUID). Caso não exista, retorna 404.',
    })
    @ApiResponse({
        status: 200,
        description: 'Safra encontrada com sucesso',
        schema: {
            example: {
                statusCode: 200,
                message: 'Harvest successfully retrieved',
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
        status: 404,
        description: 'Safra não encontrada',
        content: {
            'application/json': {
                examples: {
                    notFound: {
                        summary: 'ID não encontrado',
                        value: {
                            statusCode: 404,
                            message: 'Harvest not found',
                            error: 'Not Found',
                        },
                    },
                },
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
