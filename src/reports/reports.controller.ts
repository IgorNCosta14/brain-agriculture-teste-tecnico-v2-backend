import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { PieItem } from './repositories/reports-read-repository.interface';
import { OverviewResponse } from './dtos/overview-response.dto';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

    @Get('/overview')
    @ApiOperation({
        summary: 'Obter visão geral do dashboard',
        description:
            'Retorna total de fazendas, total de hectares, distribuição por estado, por cultura e por uso do solo.',
    })
    @ApiOkResponse({
        description: 'Dados do dashboard retornados com sucesso.',
        schema: {
            example: {
                statusCode: HttpStatus.OK,
                message: 'Reports overview successfully retrieved',
                data: {
                    overview: {
                        totalFarms: 15,
                        totalHectares: '1500.50',
                        farmsByState: [
                            { label: 'MG', value: 10 },
                            { label: 'SP', value: 5 },
                        ],
                        farmsByCrop: [
                            { label: 'Soy', value: 7 },
                            { label: 'Corn', value: 8 },
                        ],
                        landUse: [
                            { label: 'Agricultural', value: '1000.20' },
                            { label: 'Vegetation', value: '500.30' },
                        ],
                    },
                },
            },
        },
    })
    async getOverview(): Promise<{
        statusCode: number;
        message: string;
        data: { overview: OverviewResponse };
    }> {
        const overview = await this.reportsService.overview();
        return {
            statusCode: HttpStatus.OK,
            message: 'Reports overview successfully retrieved',
            data: { overview },
        };
    }

    @Get('/total-farms')
    @ApiOperation({ summary: 'Obter total de fazendas' })
    @ApiOkResponse({
        description: 'Total de fazendas retornado com sucesso.',
        schema: {
            example: {
                statusCode: HttpStatus.OK,
                message: 'Total farms successfully retrieved',
                data: { totalFarms: 15 },
            },
        },
    })
    async getTotalFarms(): Promise<{
        statusCode: number;
        message: string;
        data: { totalFarms: number };
    }> {
        const { totalFarms } = await this.reportsService.totalFarms();
        return {
            statusCode: HttpStatus.OK,
            message: 'Total farms successfully retrieved',
            data: { totalFarms },
        };
    }

    @Get('/total-hectares')
    @ApiOperation({ summary: 'Obter total de hectares' })
    @ApiOkResponse({
        description: 'Total de hectares retornado com sucesso.',
        schema: {
            example: {
                statusCode: HttpStatus.OK,
                message: 'Total hectares successfully retrieved',
                data: { totalHectares: '1500.50' },
            },
        },
    })
    async getTotalHectares(): Promise<{
        statusCode: number;
        message: string;
        data: { totalHectares: string };
    }> {
        const { totalHectares } = await this.reportsService.totalHectares();
        return {
            statusCode: HttpStatus.OK,
            message: 'Total hectares successfully retrieved',
            data: { totalHectares },
        };
    }

    @Get('/pie-by-state')
    @ApiOperation({ summary: 'Obter fazendas por estado' })
    @ApiOkResponse({
        description: 'Fazendas por estado retornadas com sucesso.',
        schema: {
            example: {
                statusCode: HttpStatus.OK,
                message: 'Farms by state successfully retrieved',
                data: {
                    farmsByState: [
                        { label: 'MG', value: 10 },
                        { label: 'SP', value: 5 },
                    ],
                },
            },
        },
    })
    async getFarmsByState(): Promise<{
        statusCode: number;
        message: string;
        data: { farmsByState: PieItem[] };
    }> {
        const farmsByState = await this.reportsService.farmsByState();
        return {
            statusCode: HttpStatus.OK,
            message: 'Farms by state successfully retrieved',
            data: { farmsByState },
        };
    }

    @Get('/pie-by-crop')
    @ApiOperation({ summary: 'Obter fazendas por cultura plantada' })
    @ApiOkResponse({
        description: 'Fazendas por cultura retornadas com sucesso.',
        schema: {
            example: {
                statusCode: HttpStatus.OK,
                message: 'Farms by crop successfully retrieved',
                data: {
                    farmsByCrop: [
                        { label: 'Soy', value: 7 },
                        { label: 'Corn', value: 8 },
                    ],
                },
            },
        },
    })
    async getFarmsByCrop(): Promise<{
        statusCode: number;
        message: string;
        data: { farmsByCrop: PieItem[] };
    }> {
        const farmsByCrop = await this.reportsService.farmsByCrop();
        return {
            statusCode: HttpStatus.OK,
            message: 'Farms by crop successfully retrieved',
            data: { farmsByCrop },
        };
    }

    @Get('/pie-by-land-use')
    @ApiOperation({ summary: 'Obter distribuição de uso do solo' })
    @ApiOkResponse({
        description: 'Distribuição de uso do solo retornada com sucesso.',
        schema: {
            example: {
                statusCode: HttpStatus.OK,
                message: 'Land use successfully retrieved',
                data: {
                    landUse: [
                        { label: 'Agricultural', value: '1000.20' },
                        { label: 'Vegetation', value: '500.30' },
                    ],
                },
            },
        },
    })
    async getLandUse(): Promise<{
        statusCode: number;
        message: string;
        data: { landUse: PieItem[] };
    }> {
        const landUse = await this.reportsService.landUse();
        return {
            statusCode: HttpStatus.OK,
            message: 'Land use successfully retrieved',
            data: { landUse },
        };
    }
}
