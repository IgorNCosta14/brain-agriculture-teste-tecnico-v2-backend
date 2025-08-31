import { Test, TestingModule } from '@nestjs/testing';
import { HarvestsService } from './harvests.service';
import { IHarvestRepository } from './repositories/harvest-repository.interface';
import { HarvestRepository } from './repositories/implementation/harvest.repository';
import { Harvest } from './harvest.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { HarvestOrderByEnum } from './enum/harvest-order-by.enum';
import { FindAllHarvestsRespDto } from './dtos/find-all-harvests-resp.dto';
import { FindAllHarvestsDto } from './dtos/find-all-harvests.dto';

describe('HarvestsService', () => {
    let service: HarvestsService;
    let repo: jest.Mocked<IHarvestRepository>;

    const makeRepoMock = (): jest.Mocked<IHarvestRepository> => ({
        createHarvest: jest.fn(),
        findById: jest.fn(),
        findAll: jest.fn(),
        updateHarvest: jest.fn(),
        deleteHarvest: jest.fn()
    });

    beforeEach(async () => {
        repo = makeRepoMock();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                HarvestsService,
                { provide: HarvestRepository, useValue: repo },
            ],
        }).compile();

        service = module.get(HarvestsService);
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a harvest when endDate is on or after startDate', async () => {
            const payload = {
                label: 'Safra 2025',
                year: 2025,
                startDate: '2025-01-01',
                endDate: '2025-12-31',
            };

            const created = {
                id: '2f8f4a19-6c4d-4d7e-9e2c-7d1a9e9f0b12',
                label: payload.label,
                year: payload.year,
                startDate: payload.startDate,
                endDate: payload.endDate,
                propertyCrops: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            } as Harvest;

            repo.createHarvest.mockResolvedValue(created);

            const result = await service.create(payload);

            expect(repo.createHarvest).toHaveBeenCalledWith(payload);
            expect(result).toEqual(created);
        });

        it('should allow endDate equal to startDate', async () => {
            const payload = {
                label: 'Safra Curta',
                year: 2025,
                startDate: '2025-01-01',
                endDate: '2025-01-01',
            };

            const created: Harvest = {
                id: '11111111-1111-1111-1111-111111111111',
                label: payload.label,
                year: payload.year,
                startDate: payload.startDate,
                endDate: payload.endDate,
                propertyCrops: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            repo.createHarvest.mockResolvedValue(created);

            const result = await service.create(payload);

            expect(repo.createHarvest).toHaveBeenCalledWith(payload);
            expect(result).toEqual(created);
        });

        it('should throw BadRequestException when endDate is before startDate', async () => {
            const payload = {
                label: 'Safra inválida',
                year: 2025,
                startDate: '2025-12-31',
                endDate: '2025-01-01',
            };

            const act = () => service.create(payload);

            await expect(act()).rejects.toMatchObject(
                new BadRequestException('End date must be on or after start date'),
            );

            expect(repo.createHarvest).not.toHaveBeenCalled();
        });
    });

    describe('findById', () => {
        it('should return a harvest when it exists', async () => {
            const id = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
            const harvest: Harvest = {
                id,
                label: 'Safra 2025',
                year: 2025,
                startDate: '2025-01-01',
                endDate: '2025-12-31',
                propertyCrops: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            repo.findById.mockResolvedValue(harvest);

            const result = await service.findById(id);

            expect(repo.findById).toHaveBeenCalledWith(id);
            expect(result).toBe(harvest);
        });

        it('should throw NotFoundException when harvest does not exist', async () => {
            const id = 'ffffffff-1111-2222-3333-444444444444';
            repo.findById.mockResolvedValue(null);

            const act = () => service.findById(id);

            await expect(act()).rejects.toMatchObject(
                new NotFoundException('Harvest not found'),
            );

            expect(repo.findById).toHaveBeenCalledWith(id);
        });
    });

    describe('findHarvests', () => {
        it('should return paginated harvests with given params', async () => {
            const params = {
                order: 'DESC' as const,
                page: 2,
                limit: 10,
                orderBy: HarvestOrderByEnum.YEAR,
            };

            const resp = {
                items: [
                    {
                        id: 'h-1',
                        label: 'Safra 2025',
                        year: 2025,
                        startDate: '2025-01-01',
                        endDate: '2025-12-31',
                        propertyCrops: [],
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                    {
                        id: 'h-2',
                        label: 'Safra 2024',
                        year: 2024,
                        startDate: '2024-01-01',
                        endDate: '2024-12-31',
                        propertyCrops: [],
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                ] as Harvest[],
                total: 12,
                totalPages: 2,
                page: 2,
                limit: 10,
                orderBy: HarvestOrderByEnum.YEAR,
                order: 'DESC' as const,
            } satisfies FindAllHarvestsRespDto;

            repo.findAll.mockResolvedValue(resp);

            const result = await service.findHarvests(params);

            expect(repo.findAll).toHaveBeenCalledWith(params);
            expect(result).toEqual(resp);
        });

        it('should return empty list when repository finds nothing', async () => {
            const params = {} as any;

            const resp = {
                items: [] as Harvest[],
                total: 0,
                totalPages: 0,
                page: 1,
                limit: 10,
                orderBy: HarvestOrderByEnum.CREATED_AT,
                order: 'ASC' as const,
            } satisfies FindAllHarvestsRespDto;

            repo.findAll.mockResolvedValue(resp);

            const result = await service.findHarvests(params);

            expect(repo.findAll).toHaveBeenCalledWith(params);
            expect(result).toEqual(resp);
        });

        it('should pass through parameters unchanged to repository', async () => {
            const params = {
                order: 'ASC' as const,
                page: 3,
                limit: 5,
                orderBy: HarvestOrderByEnum.LABEL,
            };

            const resp = {
                items: [] as Harvest[],
                total: 0,
                totalPages: 0,
                page: 3,
                limit: 5,
                orderBy: HarvestOrderByEnum.LABEL,
                order: 'ASC' as const,
            } satisfies FindAllHarvestsRespDto;

            repo.findAll.mockResolvedValue(resp);

            const result = await service.findHarvests(params);

            expect(repo.findAll).toHaveBeenCalledTimes(1);
            expect(repo.findAll).toHaveBeenCalledWith(params);
            expect(result).toEqual(resp);
        });

        it('should pass through parameters unchanged to repository', async () => {
            const params: FindAllHarvestsDto = {
                order: 'ASC',
                page: 3,
                limit: 5,
                orderBy: HarvestOrderByEnum.LABEL,
            };

            const resp: FindAllHarvestsRespDto = {
                items: [] as Harvest[],
                total: 0,
                totalPages: 0,
                page: 3,
                limit: 5,
                orderBy: HarvestOrderByEnum.LABEL,
                order: 'ASC',
            };

            repo.findAll.mockResolvedValue(resp);

            const result = await service.findHarvests(params);

            expect(repo.findAll).toHaveBeenCalledTimes(1);
            expect(repo.findAll).toHaveBeenCalledWith(params);
            expect(result).toEqual(resp);
        });
    });
});