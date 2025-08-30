import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { ReportsReadRepository } from './repositories/implementation/reports-read.repository';
import { PieItem } from './repositories/reports-read-repository.interface';

describe('ReportsService', () => {
    let service: ReportsService;
    let repo: jest.Mocked<ReportsReadRepository>;

    const makeRepoMock = (): jest.Mocked<ReportsReadRepository> =>
    ({
        totalFarms: jest.fn(),
        totalHectares: jest.fn(),
        farmsByState: jest.fn(),
        farmsByCrop: jest.fn(),
        landUse: jest.fn(),
    } as unknown as jest.Mocked<ReportsReadRepository>);

    beforeEach(async () => {
        repo = makeRepoMock();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ReportsService,
                { provide: ReportsReadRepository, useValue: repo },
            ],
        }).compile();

        service = module.get(ReportsService);
        jest.clearAllMocks();
    });

    describe('totalFarms', () => {
        it('should return total farms from repository', async () => {
            repo.totalFarms.mockResolvedValue(42);

            const result = await service.totalFarms();

            expect(repo.totalFarms).toHaveBeenCalledTimes(1);
            expect(result).toEqual({ totalFarms: 42 });
        });
    });

    describe('totalHectares', () => {
        it('should return total hectares from repository', async () => {
            repo.totalHectares.mockResolvedValue('1234.56');

            const result = await service.totalHectares();

            expect(repo.totalHectares).toHaveBeenCalledTimes(1);
            expect(result).toEqual({ totalHectares: '1234.56' });
        });
    });

    describe('farmsByState', () => {
        it('should return pie data grouped by state', async () => {
            const rows: PieItem[] = [
                { label: 'MG', value: 10 },
                { label: 'SP', value: 5 },
            ];
            repo.farmsByState.mockResolvedValue(rows);

            const result = await service.farmsByState();

            expect(repo.farmsByState).toHaveBeenCalledTimes(1);
            expect(result).toBe(rows);
        });
    });

    describe('farmsByCrop', () => {
        it('should return pie data grouped by crop', async () => {
            const rows: PieItem[] = [
                { label: 'Soy', value: 7 },
                { label: 'Corn', value: 8 },
            ];
            repo.farmsByCrop.mockResolvedValue(rows);

            const result = await service.farmsByCrop();

            expect(repo.farmsByCrop).toHaveBeenCalledTimes(1);
            expect(result).toBe(rows);
        });
    });

    describe('landUse', () => {
        it('should return land use distribution', async () => {
            const rows: PieItem[] = [
                { label: 'Agricultural', value: '1000.20' },
                { label: 'Vegetation', value: '500.30' },
            ];
            repo.landUse.mockResolvedValue(rows);

            const result = await service.landUse();

            expect(repo.landUse).toHaveBeenCalledTimes(1);
            expect(result).toBe(rows);
        });
    });

    describe('overview', () => {
        it('should aggregate all metrics and return overview payload', async () => {
            const totalFarms = 15;
            const totalHectares = '1500.50';
            const farmsByState: PieItem[] = [
                { label: 'MG', value: 10 },
                { label: 'SP', value: 5 },
            ];
            const farmsByCrop: PieItem[] = [
                { label: 'Soy', value: 7 },
                { label: 'Corn', value: 8 },
            ];
            const landUse: PieItem[] = [
                { label: 'Agricultural', value: '1000.20' },
                { label: 'Vegetation', value: '500.30' },
            ];

            repo.totalFarms.mockResolvedValue(totalFarms);
            repo.totalHectares.mockResolvedValue(totalHectares);
            repo.farmsByState.mockResolvedValue(farmsByState);
            repo.farmsByCrop.mockResolvedValue(farmsByCrop);
            repo.landUse.mockResolvedValue(landUse);

            const result = await service.overview();

            expect(repo.totalFarms).toHaveBeenCalledTimes(1);
            expect(repo.totalHectares).toHaveBeenCalledTimes(1);
            expect(repo.farmsByState).toHaveBeenCalledTimes(1);
            expect(repo.farmsByCrop).toHaveBeenCalledTimes(1);
            expect(repo.landUse).toHaveBeenCalledTimes(1);

            expect(result).toEqual({
                totalFarms,
                totalHectares,
                farmsByState,
                farmsByCrop,
                landUse,
            });
        });

        it('should work when repository returns empty arrays and zero-like values', async () => {
            repo.totalFarms.mockResolvedValue(0);
            repo.totalHectares.mockResolvedValue('0');
            repo.farmsByState.mockResolvedValue([]);
            repo.farmsByCrop.mockResolvedValue([]);
            repo.landUse.mockResolvedValue([]);

            const result = await service.overview();

            expect(result).toEqual({
                totalFarms: 0,
                totalHectares: '0',
                farmsByState: [],
                farmsByCrop: [],
                landUse: [],
            });
        });
    });
});
