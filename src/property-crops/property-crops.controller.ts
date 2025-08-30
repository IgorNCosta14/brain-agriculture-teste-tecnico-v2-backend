import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Query } from "@nestjs/common";
import { PropertyCropService } from "./property-crops.service";
import { CreatePropertyCropBodyDto } from "./dtos/create-property-crop-body.dto";
import { FindPropertyCropByIdParamsDto } from "./dtos/find-property-crop-by-id-params.dto";
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiResponse } from "@nestjs/swagger";
import { PropertyCropsQueryDto } from "./dtos/property-crops-query.dto";

@Controller('property-crops')
export class PropertyCropController {
    constructor(
        private readonly service: PropertyCropService
    ) { }

    @Post('/')
    @ApiOperation({
        summary: 'Criar vínculo de cultura com propriedade/safra',
        description:
            'Cria um registro que vincula uma propriedade rural, uma safra e uma cultura plantada.',
    })
    @ApiBody({
        description:
            'Corpo da requisição para criar um vínculo entre propriedade, safra e cultura.',
        examples: {
            valid: {
                summary: 'Exemplo válido',
                value: {
                    propertyId: '7b0f9a8e-4d8f-4a3b-bc12-6a4b6f8b1c2d',
                    harvestId: '9a7e2d1c-1b2a-4c3d-9e8f-0a1b2c3d4e5f',
                    cropId: 'c8c3e1a4-f2d1-4b9e-8a23-1e4f5a6b7c8d',
                },
            },
        },
    })
    @ApiCreatedResponse({
        description: 'Vínculo criado com sucesso.',
        schema: {
            example: {
                statusCode: 201,
                message: 'Property crop successfully created',
                data: {
                    propertyCrop: {
                        id: 'bf7c7f32-5a6d-4a9b-8c21-1079f1db2d31',
                        property_id: '7b0f9a8e-4d8f-4a3b-bc12-6a4b6f8b1c2d',
                        harvest_id: '9a7e2d1c-1b2a-4c3d-9e8f-0a1b2c3d4e5f',
                        crop_id: 'c8c3e1a4-f2d1-4b9e-8a23-1e4f5a6b7c8d',
                        created_at: '2025-08-30T12:00:00.000Z',
                        updated_at: '2025-08-30T12:00:00.000Z',
                    },
                },
            },
        },
    })
    @ApiBadRequestResponse({
        description: 'Requisição inválida.',
        schema: {
            example: {
                statusCode: 400,
                message: 'Invalid payload',
                error: 'Bad Request',
            },
        },
    })
    async createPropertyCrop(
        @Body() {
            propertyId,
            harvestId,
            cropId
        }: CreatePropertyCropBodyDto
    ) {
        const propertyCrop = await this.service.createPropertyCrop({
            propertyId,
            harvestId,
            cropId
        });

        return {
            statusCode: HttpStatus.CREATED,
            message: 'Property crop successfully created',
            data: { propertyCrop }
        }
    }

    @Get('/')
    @ApiOperation({
        summary: 'Listar vínculos de culturas',
        description: `
            Endpoint para listar os vínculos entre propriedades, safras e culturas.

            - Suporta **paginação** (page, limit).
            - Suporta **ordenação** (order, orderBy).
            - Permite aplicar **filtros por ID** (propertyId, harvestId, cropId).
            - Retorna dados completos da propriedade, safra e cultura relacionados.

            **Observações:**
            - "order" pode ser 'ASC' ou 'DESC'.
            - "orderBy" pode ser um dos campos: 'createdAt', 'updatedAt'.
    `,
    })
    @ApiOkResponse({
        description: 'Lista paginada de vínculos retornada com sucesso',
        schema: {
            example: {
                statusCode: 200,
                message: 'Property crops successfully found',
                data: {
                    propertyCrops: {
                        items: [
                            {
                                id: '841a07b8-5eae-4c99-b60f-c02e03df4a6b',
                                property: {
                                    id: 'a4527ea2-915e-4729-ad30-1de710adabbf',
                                    name: 'Green Valley Farm',
                                    city: 'Uberlândia',
                                    state: 'MG',
                                    totalAreaHa: '1500.20',
                                    arableAreaHa: '1000.20',
                                    vegetationAreaHa: '500.00',
                                    cep: '38400100',
                                    complement: 'Near BR-050',
                                    latitude: '-18.918600',
                                    longitude: '-48.277200',
                                    createdAt: '2025-08-29T23:49:20.105Z',
                                    updatedAt: '2025-08-29T23:49:20.105Z',
                                    deletedAt: null,
                                },
                                harvest: {
                                    id: '0f6107bc-2bc0-4125-8c16-b6030df20d4b',
                                    label: '2ª Safra 2025',
                                    year: 2025,
                                    startDate: '2025-01-29',
                                    endDate: '2025-04-30',
                                    createdAt: '2025-08-29T16:19:34.118Z',
                                    updatedAt: '2025-08-29T16:19:34.118Z',
                                },
                                crop: {
                                    id: '6c6212e8-eff6-48ab-879b-dec77e5c585d',
                                    name: 'Milho',
                                    createdAt: '2025-08-28T22:57:02.968Z',
                                },
                                createdAt: '2025-08-30T09:51:38.909Z',
                                updatedAt: '2025-08-30T09:51:38.909Z',
                                deletedAt: null,
                            },
                        ],
                        total: 1,
                        totalPages: 1,
                        page: 1,
                        limit: 10,
                        order: 'DESC',
                        orderBy: 'createdAt',
                    },
                },
            },
        },
    })
    async getPropertyCrops(
        @Query() { order, orderBy, page, limit, propertyId, harvestId, cropId }: PropertyCropsQueryDto,
    ) {
        const propertyCrops = await this.service.getProperties({
            order,
            page,
            limit,
            orderBy,
            propertyId,
            harvestId,
            cropId
        });

        return {
            statusCode: HttpStatus.OK,
            message: 'Property crops successfully found',
            data: {
                propertyCrops,
            },
        };
    }


    @Get('/:id')
    @ApiOperation({
        summary: 'Buscar vínculo por ID',
        description:
            'Retorna um único registro de vínculo (propriedade/safra/cultura) pelo seu identificador.',
    })
    @ApiParam({
        name: 'id',
        description: 'Identificador do vínculo (UUID).',
        example: 'bf7c7f32-5a6d-4a9b-8c21-1079f1db2d31',
    })
    @ApiOkResponse({
        description: 'Vínculo encontrado.',
        schema: {
            example: {
                statusCode: 200,
                message: 'Property crop successfully found',
                data: {
                    propertyCrops: {
                        id: '841a07b8-5eae-4c99-b60f-c02e03df4a6b',
                        property: {
                            id: 'a4527ea2-915e-4729-ad30-1de710adabbf',
                            name: 'Green Valley Farm',
                            city: 'Uberlândia',
                            state: 'MG',
                            totalAreaHa: '1500.20',
                            arableAreaHa: '1000.20',
                            vegetationAreaHa: '500.00',
                            cep: '38400100',
                            complement: 'Near BR-050',
                            latitude: '-18.918600',
                            longitude: '-48.277200',
                            createdAt: '2025-08-29T23:49:20.105Z',
                            updatedAt: '2025-08-29T23:49:20.105Z',
                            deletedAt: null,
                        },
                        harvest: {
                            id: '0f6107bc-2bc0-4125-8c16-b6030df20d4b',
                            label: '2ª Safra 2025',
                            year: 2025,
                            startDate: '2025-01-29',
                            endDate: '2025-04-30',
                            createdAt: '2025-08-29T16:19:34.118Z',
                            updatedAt: '2025-08-29T16:19:34.118Z',
                        },
                        crop: {
                            id: '6c6212e8-eff6-48ab-879b-dec77e5c585d',
                            name: 'Milho',
                            createdAt: '2025-08-28T22:57:02.968Z',
                        },
                        createdAt: '2025-08-30T09:51:38.909Z',
                        updatedAt: '2025-08-30T09:51:38.909Z',
                        deletedAt: null,
                    },
                },
            },
        },
    })
    @ApiResponse({
        status: 404,
        description: 'Vínculo não encontrado.',
        schema: {
            example: {
                statusCode: 404,
                message: 'Property crop not found',
                error: 'Not Found',
            },
        },
    })
    async getPpropertyCropById(
        @Param() { id }: FindPropertyCropByIdParamsDto
    ) {
        const propertyCrops = await this.service.getPropertyById(id);

        return {
            statusCode: HttpStatus.OK,
            message: 'Property crop successfully found',
            data: { propertyCrops }
        }
    }

    @Delete('/:id')
    @ApiOperation({
        summary: 'Excluir vínculo por ID',
        description:
            'Exclui um registro de vínculo (propriedade/safra/cultura) pelo seu identificador.',
    })
    @ApiParam({
        name: 'id',
        description: 'Identificador do vínculo (UUID).',
        example: 'bf7c7f32-5a6d-4a9b-8c21-1079f1db2d31',
    })
    @ApiOkResponse({
        description: 'Vínculo excluído com sucesso.',
        schema: {
            example: {
                statusCode: 200,
                message: 'Property crop successfully delete',
            },
        },
    })
    @ApiResponse({
        status: 404,
        description: 'Vínculo não encontrado.',
        schema: {
            example: {
                statusCode: 404,
                message: 'Property crop not found',
                error: 'Not Found',
            },
        },
    })
    async deletePpropertyCrop(
        @Param() { id }: FindPropertyCropByIdParamsDto
    ) {
        await this.service.deleteProperty(id);

        return {
            statusCode: HttpStatus.OK,
            message: 'Property crop successfully delete',
        }
    }
}