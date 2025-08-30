import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query } from "@nestjs/common";
import { ProducersService } from "./producers.service";
import { CreateProducerBodyDto } from "./dtos/create-producer-body.dto";
import { FindProducerByIdParamsDto } from "./dtos/find-producer-by-id-params.dto";
import { UpdateProducerBodyDto } from "./dtos/update-producer-body.dto";
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { ProducersQueryDto } from "./dtos/producers-query.dto";

@ApiTags('Producers')
@Controller('producers')
export class ProducersController {
    constructor(
        private readonly service: ProducersService
    ) { }

    @Post('/')
    @ApiOperation({
        summary: 'Criar produtor (agricultor)',
        description:
            'Endpoint para criação de produtores (agricultores). Valida CPF/CNPJ, garante unicidade por nome e documento e retorna apenas os campos essenciais do produtor criado.',
    })
    @ApiBody({
        required: true,
        examples: {
            valid: {
                summary: 'Exemplo válido',
                value: {
                    document: '12345678909',
                    name: 'Acme Farming Co.',
                },
            },
        },
    })
    @ApiCreatedResponse({
        description: 'Produtor criado com sucesso.',
        examples: {
            success: {
                summary: 'Sucesso',
                value: {
                    statusCode: 201,
                    message: 'Producer successfully created',
                    data: {
                        producer: {
                            id: '0bf1b1e7-6a9d-44a7-8f97-9a2b0a8e0c1a',
                            name: 'jane doe',
                        }
                    },
                },
            },
        },
    })
    @ApiBadRequestResponse({
        description: 'Erros de validação ou conflito de dados.',
        examples: {
            duplicateName: {
                summary: 'Nome já utilizado',
                value: {
                    statusCode: 400,
                    error: 'Bad Request',
                    message: 'Producer name already exists',
                },
            },
            duplicateDocument: {
                summary: 'Documento já utilizado',
                value: {
                    statusCode: 400,
                    error: 'Bad Request',
                    message: 'Producer document already exists',
                },
            },
            invalidDocument: {
                summary: 'Documento inválido (CPF/CNPJ inválido)',
                value: {
                    statusCode: 400,
                    error: 'Bad Request',
                    message: 'Invalid document',
                },
            },
            validationError: {
                summary: 'Erro de validação do body',
                value: {
                    statusCode: 400,
                    error: 'Bad Request',
                    message: [
                        'document must be a string',
                        'name should not be empty',
                    ],
                },
            },
        },
    })
    async createProducer(
        @Body() { document, name }: CreateProducerBodyDto
    ) {
        const producer = await this.service.createProducer({
            document,
            name
        })

        return {
            statusCode: HttpStatus.CREATED,
            message: 'Producer successfully created',
            data: { producer }
        }
    }

    @Get('/')
    @ApiOperation({
        summary: 'Listar todos os produtores',
        description:
            'Retorna a lista paginada de produtores (agricultores) cadastrados no sistema, com suporte a paginação e ordenação.',
    })
    @ApiOkResponse({
        description: 'Lista de produtores retornada com sucesso',
        schema: {
            example: {
                statusCode: 200,
                message: 'Producers successfully retrieved',
                data: {
                    producers: {
                        items: [
                            {
                                id: '1015ce5b-4563-466b-a514-de157fde9b9a',
                                documentType: 'CPF',
                                document: '14805924713',
                                name: 'igor 1',
                                createdAt: '2025-08-29T21:53:50.964Z',
                                updatedAt: '2025-08-29T21:53:50.964Z',
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
    @Get('/')
    async findProducers(
        @Query() { order, orderBy, page, limit }: ProducersQueryDto
    ) {
        const producers = await this.service.getProducers({ order, orderBy, page, limit });

        return {
            statusCode: HttpStatus.OK,
            message: 'Producers successfully retrieved',
            data: { producers },
        };
    }


    @Get('/:id')
    @ApiOperation({
        summary: 'Buscar produtor por ID',
        description:
            'Endpoint para buscar um produtor (agricultor) específico pelo seu ID (UUID v4).',
    })
    @ApiParam({
        name: 'id',
        description: 'UUID v4 do produtor',
        example: '0bf1b1e7-6a9d-44a7-8f97-9a2b0a8e0c1a',
    })
    @ApiOkResponse({
        description: 'Produtor encontrado com sucesso.',
        examples: {
            success: {
                summary: 'Sucesso',
                value: {
                    statusCode: 200,
                    message: 'Producer successfully found',
                    data: {
                        producer: {
                            id: '1015ce5b-4563-466b-a514-de157fde9b9a',
                            documentType: 'CPF',
                            document: '14805924713',
                            name: 'igor 1',
                            properties: [
                                {
                                    id: 'a4527ea2-915e-4729-ad30-1de710adabbf',
                                    name: 'Green Valley Farm',
                                },
                            ],
                            createdAt: '2025-08-29T21:53:50.964Z',
                            updatedAt: '2025-08-29T21:53:50.964Z',
                            deletedAt: null,
                        },
                    },
                },
            },
        },
    })
    @ApiBadRequestResponse({
        description: 'ID ausente ou inválido.',
        examples: {
            missingId: {
                summary: 'Id não fornecido',
                value: {
                    statusCode: 400,
                    error: 'Bad Request',
                    message: 'Id is required!',
                },
            },
            invalidUuid: {
                summary: 'Formato de UUID inválido',
                value: {
                    statusCode: 400,
                    error: 'Bad Request',
                    message:
                        'Id must be a valid UUID (version 4), it should be provided in params',
                },
            },
        },
    })
    @ApiNotFoundResponse({
        description: 'Produtor não encontrado.',
        examples: {
            notFound: {
                summary: 'Produtor inexistente',
                value: {
                    statusCode: 404,
                    error: 'Not Found',
                    message: 'Producer not found!',
                },
            },
        },
    })
    async findProducerById(
        @Param() { id }: FindProducerByIdParamsDto
    ) {
        const producer = await this.service.findProducerById(id)

        return {
            statusCode: HttpStatus.OK,
            message: 'Producer successfully found',
            data: { producer }
        }
    }

    @Put('/:id')
    @ApiOperation({
        summary: 'Atualizar produtor por ID',
        description:
            'Endpoint para atualizar parcialmente as informações de um produtor (agricultor). Permite alterar document (CPF/CNPJ) e/ou name. Valida unicidade e consistência do documento.',
    })
    @ApiParam({
        name: 'id',
        description: 'UUID v4 do produtor',
        example: '0bf1b1e7-6a9d-44a7-8f97-9a2b0a8e0c1a',
    })
    @ApiBody({
        required: true,
        examples: {
            updateName: {
                summary: 'Atualizando apenas o nome',
                value: {
                    name: 'Acme Farming Co. (Updated)',
                },
            },
            updateDocument: {
                summary: 'Atualizando apenas o documento',
                value: {
                    document: '12345678000195',
                },
            },
            updateBoth: {
                summary: 'Atualizando nome e documento',
                value: {
                    name: 'Green Valley LTDA',
                    document: '12345678909',
                },
            },
        },
    })
    @ApiOkResponse({
        description: 'Produtor atualizado com sucesso.',
        examples: {
            success: {
                summary: 'Sucesso',
                value: {
                    statusCode: 200,
                    message: 'Producer successfully updated',
                    data: {
                        producer: {
                            id: '0bf1b1e7-6a9d-44a7-8f97-9a2b0a8e0c1a',
                            document: '12345678909',
                            documentType: 'CPF',
                            name: 'Acme Farming Co. (Updated)',
                            created_at: '2025-08-27T17:10:20.000Z',
                            updated_at: '2025-08-27T18:20:00.000Z',
                            deleted_at: null,
                        }
                    },
                },
            },
        },
    })
    @ApiBadRequestResponse({
        description:
            'Erros de validação, id ausente/inválido, documento/nome duplicados ou documento inválido.',
        examples: {
            missingId: {
                summary: 'Id não fornecido',
                value: {
                    statusCode: 400,
                    error: 'Bad Request',
                    message: 'Id is required!',
                },
            },
            invalidUuid: {
                summary: 'UUID inválido',
                value: {
                    statusCode: 400,
                    error: 'Bad Request',
                    message:
                        'Id must be a valid UUID (version 4), it should be provided in params',
                },
            },
            duplicateDocument: {
                summary: 'Documento já utilizado por outro produtor',
                value: {
                    statusCode: 400,
                    error: 'Bad Request',
                    message: 'Producer document already exists',
                },
            },
            duplicateName: {
                summary: 'Nome já utilizado por outro produtor',
                value: {
                    statusCode: 400,
                    error: 'Bad Request',
                    message: 'Producer name already exists',
                },
            },
            invalidDocument: {
                summary: 'Documento inválido (CPF/CNPJ inválido)',
                value: {
                    statusCode: 400,
                    error: 'Bad Request',
                    message: 'Invalid document',
                },
            },
            validationError: {
                summary: 'Erros de validação no body',
                value: {
                    statusCode: 400,
                    error: 'Bad Request',
                    message: [
                        'document must be a string',
                        'document must have between 11 and 14 digits',
                        'name must be a string',
                    ],
                },
            },
        },
    })
    @ApiNotFoundResponse({
        description: 'Produtor não encontrado.',
        examples: {
            notFound: {
                summary: 'Produtor inexistente',
                value: {
                    statusCode: 404,
                    error: 'Not Found',
                    message: 'Producer not found!',
                },
            },
        },
    })
    async updateProducer(
        @Param() { id }: FindProducerByIdParamsDto,
        @Body() { document, name }: UpdateProducerBodyDto
    ) {
        const producer = await this.service.updateProducer({
            id,
            document,
            name
        })

        return {
            statusCode: HttpStatus.OK,
            message: 'Producer successfully updated',
            data: { producer }
        }
    }

    @Delete('/:id')
    @ApiOperation({
        summary: 'Excluir produtor (soft delete)',
        description:
            'Endpoint para realizar um soft delete em um produtor (agricultor) identificado pelo seu id. O registro não é removido do banco, apenas marcado como deletado (deleted_at).',
    })
    @ApiParam({
        name: 'id',
        description: 'UUID v4 do produtor',
        example: '0bf1b1e7-6a9d-44a7-8f97-9a2b0a8e0c1a',
    })
    @ApiOkResponse({
        description: 'Produtor excluído (soft delete) com sucesso.',
        examples: {
            success: {
                summary: 'Sucesso',
                value: {
                    statusCode: 200,
                    message: 'Producer successfully deleted',
                },
            },
        },
    })
    @ApiBadRequestResponse({
        description: 'Id ausente ou inválido.',
        examples: {
            missingId: {
                summary: 'Id não fornecido',
                value: {
                    statusCode: 400,
                    error: 'Bad Request',
                    message: 'Id is required!',
                },
            },
            invalidUuid: {
                summary: 'Formato de UUID inválido',
                value: {
                    statusCode: 400,
                    error: 'Bad Request',
                    message:
                        'Id must be a valid UUID (version 4), it should be provided in params',
                },
            },
        },
    })
    @ApiNotFoundResponse({
        description: 'Produtor não encontrado.',
        examples: {
            notFound: {
                summary: 'Produtor inexistente',
                value: {
                    statusCode: 404,
                    error: 'Not Found',
                    message: 'Producer not found!',
                },
            },
        },
    })
    async deleteProducer(
        @Param() { id }: FindProducerByIdParamsDto
    ) {
        await this.service.deleteProducer(id)

        return {
            statusCode: HttpStatus.OK,
            message: 'Producer successfully deleted',
        }
    }
}