import { Body, Controller, Get, HttpStatus, Post, Param } from '@nestjs/common';
import { CropsService } from './crops.service';
import { CreateCropBodyDto } from './dtos/create-crop-body.dto';
import { CropIdParamsDto } from './dtos/crop-id-params.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('crops')
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
        description:
            'Retorna a lista de todas as culturas cadastradas, contendo apenas o identificador (id) e o nome, em ordem alfabética.',
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
            },
        },
    })
    async findAllCrops() {
        const crops = await this.service.findAll();

        return {
            statusCode: HttpStatus.OK,
            message: 'Crops successfully retrieved',
            data: { crops },
        };
    }

    @ApiOperation({
        summary: 'Buscar cultura por ID',
        description:
            'Retorna uma cultura específica a partir do seu identificador único (UUID). Caso o ID não exista, será retornado erro 404.',
    })
    @ApiResponse({
        status: 200,
        description: 'Cultura encontrada com sucesso',
        schema: {
            example: {
                statusCode: 200,
                message: 'Crop successfully retrieved',
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
        status: 404,
        description: 'Cultura não encontrada',
        content: {
            'application/json': {
                examples: {
                    notFound: {
                        summary: 'ID não existe no banco de dados',
                        value: {
                            statusCode: 404,
                            message: 'Crop not found',
                            error: 'Not Found',
                        },
                    },
                },
            },
        },
    })
    @Get('/:id')
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
