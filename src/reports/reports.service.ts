import { Injectable, Logger } from '@nestjs/common';
import { ReportsReadRepository } from './repositories/implementation/reports-read.repository';
import { PieItem } from './repositories/reports-read-repository.interface';
import { OverviewResponse } from './dtos/overview-response.dto';

@Injectable()
export class ReportsService {
    private readonly logger = new Logger(ReportsService.name);

    constructor(private readonly repo: ReportsReadRepository) { }

    async totalFarms(): Promise<{ totalFarms: number }> {
        const started = Date.now();

        const totalFarms = await this.repo.totalFarms();

        this.logger.debug(`totalFarms computed in ${Date.now() - started}ms`);

        return { totalFarms };
    }

    async totalHectares(): Promise<{ totalHectares: string }> {
        const started = Date.now();

        const totalHectares = await this.repo.totalHectares();

        this.logger.debug(`totalHectares computed in ${Date.now() - started}ms`);

        return { totalHectares };
    }

    async farmsByState(): Promise<PieItem[]> {
        const started = Date.now();

        const data = await this.repo.farmsByState();

        this.logger.debug(`farmsByState computed in ${Date.now() - started}ms`);

        return data;
    }

    async farmsByCrop(): Promise<PieItem[]> {
        const started = Date.now();

        const data = await this.repo.farmsByCrop();

        this.logger.debug(`farmsByCrop computed in ${Date.now() - started}ms`);

        return data;
    }

    async landUse(): Promise<PieItem[]> {
        const started = Date.now();

        const data = await this.repo.landUse();

        this.logger.debug(`landUse computed in ${Date.now() - started}ms`);

        return data;
    }

    async overview(): Promise<OverviewResponse> {
        const started = Date.now();

        const [totalFarms, totalHectares, farmsByState, farmsByCrop, landUse] = await Promise.all([
            this.repo.totalFarms(),
            this.repo.totalHectares(),
            this.repo.farmsByState(),
            this.repo.farmsByCrop(),
            this.repo.landUse()
        ]);

        this.logger.debug(`overview computed in ${Date.now() - started}ms`);

        return {
            totalFarms,
            totalHectares,
            farmsByState,
            farmsByCrop,
            landUse
        };
    }
}