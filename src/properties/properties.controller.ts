import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { PropertiesService } from "./properties.service";
import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put } from "@nestjs/common";
import { CreatePropertyBodyDto } from "./dtos/create-property-body.dto";
import { UpdatePropertyBodyDto } from "./dtos/update-property-body.dto";
import { PropertyIdParamsDto } from "./dtos/property-id-params.dto";

@ApiTags('Properties')
@Controller('properties')
export class PropertiesController {
    constructor(
        private readonly service: PropertiesService
    ) { }

    @Post('/')
    @ApiOperation({
        summary: "Criar propriedade (fazenda do produtor)",
        description:
            "Endpoint para criação de propriedades vinculadas a um produtor. Valida o UUID do produtor, campos obrigatórios e formatos numéricos (strings com até 2 casas para áreas e até 6 casas para latitude/longitude). Também valida a consistência das áreas (área agricultável + vegetação não pode exceder a área total).",
    })
    @ApiBody({
        required: true,
        examples: {
            valid: {
                summary: "Exemplo válido",
                value: {
                    producerId: "0bf1b1e7-6a9d-44a7-8f97-9a2b0a8e0c1a",
                    name: "Fazenda Boa Esperança",
                    city: "Sorriso",
                    state: "MT",
                    totalAreaHa: "1500.50",
                    arableAreaHa: "1000.00",
                    vegetationAreaHa: "500.50",
                    cep: "78555000",
                    complement: "Galpão 3",
                    latitude: "-12.546789",
                    longitude: "-55.721234",
                },
            },
        },
    })
    @ApiCreatedResponse({
        description: "Propriedade criada com sucesso.",
        examples: {
            success: {
                summary: "Sucesso",
                value: {
                    statusCode: 201,
                    message: "Property successfully created",
                    data: {
                        property: {
                            id: "4c1b3b32-5b2e-4e1d-9b7f-2a2b0a8e0c1a",
                            producer_id: "0bf1b1e7-6a9d-44a7-8f97-9a2b0a8e0c1a",
                            name: "Fazenda Boa Esperança",
                            city: "Sorriso",
                            state: "MT",
                            total_area_ha: "1500.50",
                            arable_area_ha: "1000.00",
                            vegetation_area_ha: "500.50",
                            cep: "78555000",
                            complement: "Galpão 3",
                            latitude: "-12.546789",
                            longitude: "-55.721234",
                            created_at: "2025-08-29T12:00:00.000Z",
                            updated_at: "2025-08-29T12:00:00.000Z",
                            deleted_at: null,
                        },
                    },
                },
            },
        },
    })
    @ApiBadRequestResponse({
        description: "Erros de validação ou inconsistência de dados.",
        examples: {
            validationError: {
                summary: "Erros de validação no body",
                value: {
                    statusCode: 400,
                    error: "Bad Request",
                    message: [
                        "producerId must be a valid UUID v4",
                        "name should not be empty",
                        "totalAreaHa must be a valid number with up to 2 decimal places",
                        "cep must be between 8 and 20 digits",
                        "latitude must be a valid number with up to 6 decimal places",
                    ],
                },
            },
            areaExceeded: {
                summary:
                    "Soma de áreas agricultável + vegetação maior que a área total",
                value: {
                    statusCode: 400,
                    error: "Bad Request",
                    message:
                        "Arable and vegetation areas cannot exceed total area (ha)",
                },
            },
        },
    })
    @ApiNotFoundResponse({
        description: "Produtor não encontrado para vincular a propriedade.",
        examples: {
            producerNotFound: {
                summary: "Produtor inexistente",
                value: {
                    statusCode: 404,
                    error: "Not Found",
                    message: "Producer not found!",
                },
            },
        },
    })
    async createProperty(
        @Body() {
            producerId,
            name,
            city,
            state,
            totalAreaHa,
            arableAreaHa,
            vegetationAreaHa,
            cep,
            complement,
            latitude,
            longitude
        }: CreatePropertyBodyDto
    ) {

        const property = await this.service.createPorperty({
            producerId,
            name,
            city,
            state,
            totalAreaHa,
            arableAreaHa,
            vegetationAreaHa,
            cep,
            complement,
            latitude,
            longitude
        })

        return {
            statusCode: HttpStatus.CREATED,
            message: 'Property successfully created',
            data: {
                property
            }
        }
    }

    @Put('/:id')
    @ApiOperation({
        summary: "Atualizar propriedade",
        description:
            "Endpoint para atualização de uma propriedade existente. Permite atualizar parcialmente os dados. Mantém as mesmas validações de formato das áreas (strings numéricas) e coordenadas.",
    })
    @ApiParam({
        name: "id",
        description: "UUID v4 da propriedade",
        example: "4c1b3b32-5b2e-4e1d-9b7f-2a2b0a8e0c1a",
    })
    @ApiBody({
        required: true,
        examples: {
            updateNameOnly: {
                summary: "Atualizando apenas o nome",
                value: {
                    name: "Fazenda Boa Esperança (Atualizada)",
                },
            },
            updateAreas: {
                summary: "Atualizando áreas (strings numéricas)",
                value: {
                    totalAreaHa: "2000.00",
                    arableAreaHa: "1200.00",
                    vegetationAreaHa: "800.00",
                },
            },
            updateLocation: {
                summary: "Atualizando CEP e coordenadas",
                value: {
                    cep: "78555000",
                    latitude: "-12.500000",
                    longitude: "-55.700000",
                },
            },
        },
    })
    @ApiOkResponse({
        description: "Propriedade atualizada com sucesso.",
        examples: {
            success: {
                summary: "Sucesso",
                value: {
                    statusCode: 200,
                    message: "Property successfully updated",
                    data: {
                        property: {
                            id: "4c1b3b32-5b2e-4e1d-9b7f-2a2b0a8e0c1a",
                            producer_id: "0bf1b1e7-6a9d-44a7-8f97-9a2b0a8e0c1a",
                            name: "Fazenda Boa Esperança (Atualizada)",
                            city: "Sorriso",
                            state: "MT",
                            total_area_ha: "2000.00",
                            arable_area_ha: "1200.00",
                            vegetation_area_ha: "800.00",
                            cep: "78555000",
                            complement: "Galpão 3",
                            latitude: "-12.500000",
                            longitude: "-55.700000",
                            created_at: "2025-08-29T12:00:00.000Z",
                            updated_at: "2025-08-29T13:00:00.000Z",
                            deleted_at: null,
                        },
                    },
                },
            },
        },
    })
    @ApiBadRequestResponse({
        description: "Erros de validação ou inconsistência de áreas.",
        examples: {
            invalidUuid: {
                summary: "UUID inválido (param)",
                value: {
                    statusCode: 400,
                    error: "Bad Request",
                    message:
                        "Id must be a valid UUID (version 4), it should be provided in params",
                },
            },
            validationError: {
                summary: "Erros de validação no body",
                value: {
                    statusCode: 400,
                    error: "Bad Request",
                    message: [
                        "totalAreaHa must be a valid number with up to 2 decimal places",
                        "latitude must be a valid number with up to 6 decimal places",
                    ],
                },
            },
            areaExceeded: {
                summary:
                    "Soma de áreas agricultável + vegetação maior que a área total",
                value: {
                    statusCode: 400,
                    error: "Bad Request",
                    message:
                        "Arable and vegetation areas cannot exceed total area (ha)",
                },
            },
        },
    })
    @ApiNotFoundResponse({
        description: "Propriedade não encontrada.",
        examples: {
            notFound: {
                summary: "Propriedade inexistente",
                value: {
                    statusCode: 404,
                    error: "Not Found",
                    message: "Property not found!",
                },
            },
        },
    })
    async updateProperty(
        @Param() { id }: PropertyIdParamsDto,
        @Body() {
            name,
            city,
            state,
            totalAreaHa,
            arableAreaHa,
            vegetationAreaHa,
            cep,
            complement,
            latitude,
            longitude
        }: UpdatePropertyBodyDto
    ) {
        const property = await this.service.updateProperty({
            id,
            name,
            city,
            state,
            totalAreaHa,
            arableAreaHa,
            vegetationAreaHa,
            cep,
            complement,
            latitude,
            longitude
        })

        return {
            statusCode: HttpStatus.OK,
            message: 'Property successfully updated',
            data: {
                property
            }
        }
    }

    @Get('/')
    @ApiOperation({
        summary: "Listar propriedades",
        description:
            "Endpoint para obter a lista de todas as propriedades cadastradas.",
    })
    @ApiOkResponse({
        description: "Lista de propriedades encontrada com sucesso.",
        examples: {
            success: {
                summary: "Sucesso",
                value: {
                    statusCode: 200,
                    message: "Properties successfully found",
                    data: {
                        properties: [
                            {
                                id: "4c1b3b32-5b2e-4e1d-9b7f-2a2b0a8e0c1a",
                                producer_id: "0bf1b1e7-6a9d-44a7-8f97-9a2b0a8e0c1a",
                                name: "Fazenda Boa Esperança",
                                city: "Sorriso",
                                state: "MT",
                                total_area_ha: "1500.50",
                                arable_area_ha: "1000.00",
                                vegetation_area_ha: "500.50",
                                cep: "78555000",
                                complement: "Galpão 3",
                                latitude: "-12.546789",
                                longitude: "-55.721234",
                                created_at: "2025-08-29T12:00:00.000Z",
                                updated_at: "2025-08-29T12:00:00.000Z",
                                deleted_at: null,
                            },
                        ],
                    },
                },
            },
        },
    })
    async getProperties() {
        const properties = await this.service.getPropertyAll()

        return {
            statusCode: HttpStatus.OK,
            message: 'Properties successfully found',
            data: {
                properties
            }
        }
    }

    @Get('/:id')
    @ApiOperation({
        summary: "Buscar propriedade por ID",
        description:
            "Endpoint para buscar uma propriedade específica pelo seu ID (UUID v4).",
    })
    @ApiParam({
        name: "id",
        description: "UUID v4 da propriedade",
        example: "4c1b3b32-5b2e-4e1d-9b7f-2a2b0a8e0c1a",
    })
    @ApiOkResponse({
        description: "Propriedade encontrada com sucesso.",
        examples: {
            success: {
                summary: "Sucesso",
                value: {
                    statusCode: 200,
                    message: "Property successfully found",
                    data: {
                        property: {
                            id: "4c1b3b32-5b2e-4e1d-9b7f-2a2b0a8e0c1a",
                            producer_id: "0bf1b1e7-6a9d-44a7-8f97-9a2b0a8e0c1a",
                            name: "Fazenda Boa Esperança",
                            city: "Sorriso",
                            state: "MT",
                            total_area_ha: "1500.50",
                            arable_area_ha: "1000.00",
                            vegetation_area_ha: "500.50",
                            cep: "78555000",
                            complement: "Galpão 3",
                            latitude: "-12.546789",
                            longitude: "-55.721234",
                            created_at: "2025-08-29T12:00:00.000Z",
                            updated_at: "2025-08-29T12:00:00.000Z",
                            deleted_at: null,
                        },
                    },
                },
            },
        },
    })
    @ApiBadRequestResponse({
        description: "ID ausente ou inválido.",
        examples: {
            invalidUuid: {
                summary: "UUID inválido (param)",
                value: {
                    statusCode: 400,
                    error: "Bad Request",
                    message:
                        "Id must be a valid UUID (version 4), it should be provided in params",
                },
            },
        },
    })
    @ApiNotFoundResponse({
        description: "Propriedade não encontrada.",
        examples: {
            notFound: {
                summary: "Propriedade inexistente",
                value: {
                    statusCode: 404,
                    error: "Not Found",
                    message: "Property not found!",
                },
            },
        },
    })
    async getPropertyById(
        @Param() { id }: PropertyIdParamsDto,
    ) {
        const property = await this.service.getPropertyById(id)

        return {
            statusCode: HttpStatus.OK,
            message: 'Property successfully found',
            data: {
                property
            }
        }
    }

    @Delete('/:id')
    @ApiOperation({
        summary: "Excluir propriedade (soft delete)",
        description:
            "Endpoint para realizar um soft delete em uma propriedade identificada pelo seu id. O registro não é removido fisicamente do banco; apenas marcado com deleted_at.",
    })
    @ApiParam({
        name: "id",
        description: "UUID v4 da propriedade",
        example: "4c1b3b32-5b2e-4e1d-9b7f-2a2b0a8e0c1a",
    })
    @ApiOkResponse({
        description: "Propriedade excluída (soft delete) com sucesso.",
        examples: {
            success: {
                summary: "Sucesso",
                value: {
                    statusCode: 200,
                    message: "Property successfully deleted",
                },
            },
        },
    })
    @ApiBadRequestResponse({
        description: "ID ausente ou inválido.",
        examples: {
            invalidUuid: {
                summary: "UUID inválido (param)",
                value: {
                    statusCode: 400,
                    error: "Bad Request",
                    message:
                        "Id must be a valid UUID (version 4), it should be provided in params",
                },
            },
        },
    })
    @ApiNotFoundResponse({
        description: "Propriedade não encontrada.",
        examples: {
            notFound: {
                summary: "Propriedade inexistente",
                value: {
                    statusCode: 404,
                    error: "Not Found",
                    message: "Property not found!",
                },
            },
        },
    })
    async deleteProperty(
        @Param() { id }: PropertyIdParamsDto,
    ) {
        await this.service.deleteProperty(id)

        return {
            statusCode: HttpStatus.OK,
            message: 'Property successfully deleted',
        }
    }
}