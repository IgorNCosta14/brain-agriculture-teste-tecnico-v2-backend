import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CropsService } from './crops.service';
import type { ICropRepository } from './repositories/crop-repository.interface';
import { CropRepository } from './repositories/implementation/crop.repository';
import { Crop } from './crop.entity';
import { CropOrderByEnum } from './enum/order-by-values.enum';
import { FindAllRespDto } from './dtos/find-all-resp.dto';
import { FindAllDto } from './dtos/find-all.dto';

describe('CropsService', () => {
    let service: CropsService;
    let repo: jest.Mocked<ICropRepository>;

    const makeRepoMock = (): jest.Mocked<ICropRepository> => ({
        createCrop: jest.fn(),
        findById: jest.fn(),
        findAll: jest.fn(),
        findByName: jest.fn(),
    });

    beforeEach(async () => {
        repo = makeRepoMock();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CropsService,
                { provide: CropRepository, useValue: repo },
            ],
        }).compile();

        service = module.get(CropsService);
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a crop when name is provided and unique', async () => {
            const name = 'Soybean';
            (repo.findByName as jest.Mock).mockResolvedValue(null);

            const created: Crop = {
                id: 'e3a6d1e0-4f1f-4b47-9af0-3cbd9e6f5a10',
                name,
                propertyCrops: [],
                createdAt: new Date(),
            } as Crop;

            (repo.createCrop as jest.Mock).mockResolvedValue(created);

            const result = await service.create(name);

            expect(repo.findByName).toHaveBeenCalledWith(name);
            expect(repo.createCrop).toHaveBeenCalledWith(name);
            expect(result).toBe(created);
        });

        it('should throw ConflictException when name is empty', async () => {
            const name = '';

            const act = () => service.create(name);

            await expect(act()).rejects.toMatchObject(
                new ConflictException('Crop name must not be empty'),
            );

            expect(repo.findByName).not.toHaveBeenCalled();
            expect(repo.createCrop).not.toHaveBeenCalled();
        });

        it('should throw ConflictException when crop name already exists', async () => {
            const name = 'Corn';
            (repo.findByName as jest.Mock).mockResolvedValue({
                id: 'existing-id',
                name,
            } as Crop);

            const act = () => service.create(name);

            await expect(act()).rejects.toMatchObject(
                new ConflictException('Crop with this name already exists'),
            );

            expect(repo.findByName).toHaveBeenCalledWith(name);
            expect(repo.createCrop).not.toHaveBeenCalled();
        });
    });

    describe('findById', () => {
        it('should return a crop when it exists', async () => {
            const id = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
            const crop: Crop = {
                id,
                name: 'Soybean',
                propertyCrops: [],
                createdAt: new Date(),
            } as Crop;

            (repo.findById as jest.Mock).mockResolvedValue(crop);

            const result = await service.findById(id);

            expect(repo.findById).toHaveBeenCalledWith(id);
            expect(result).toBe(crop);
        });

        it('should throw NotFoundException when crop does not exist', async () => {
            const id = 'ffffffff-1111-2222-3333-444444444444';
            (repo.findById as jest.Mock).mockResolvedValue(null);

            const act = () => service.findById(id);

            await expect(act()).rejects.toMatchObject(
                new NotFoundException('Crop not found'),
            );

            expect(repo.findById).toHaveBeenCalledWith(id);
        });
    });

    describe('findCrops', () => {
        const mockCrop: Crop = {
            id: '1234',
            name: 'Wheat',
            propertyCrops: [],
            createdAt: new Date('2023-01-01'),
        } as Crop;

        const createFindAllDto = (
            overrides?: Partial<FindAllDto>,
        ): FindAllDto => ({
            order: 'ASC',
            page: 1,
            limit: 10,
            orderBy: CropOrderByEnum.NAME,
            ...overrides,
        });

        const createFindAllRespDto = (
            overrides?: Partial<FindAllRespDto>,
        ): FindAllRespDto => ({
            items: [mockCrop],
            total: 1,
            totalPages: 1,
            page: 1,
            limit: 10,
            order: 'ASC',
            orderBy: CropOrderByEnum.NAME,
            ...overrides,
        });

        it('should return paginated crops ordered by NAME', async () => {
            const dto = createFindAllDto({ orderBy: CropOrderByEnum.NAME });
            const expected = createFindAllRespDto({ orderBy: CropOrderByEnum.NAME });

            (repo.findAll as jest.Mock).mockResolvedValue(expected);

            const result = await service.findCrops(dto);

            expect(repo.findAll).toHaveBeenCalledWith(dto);
            expect(result).toEqual(expected);
        });

        it('should return paginated crops ordered by CREATED_AT', async () => {
            const dto = createFindAllDto({ orderBy: CropOrderByEnum.CREATED_AT });
            const expected = createFindAllRespDto({ orderBy: CropOrderByEnum.CREATED_AT });

            (repo.findAll as jest.Mock).mockResolvedValue(expected);

            const result = await service.findCrops(dto);

            expect(repo.findAll).toHaveBeenCalledWith(dto);
            expect(result).toEqual(expected);
        });

        it('should return paginated crops with default pagination', async () => {
            const dto = createFindAllDto({ page: undefined, limit: undefined });
            const expected = createFindAllRespDto({ page: 1, limit: 10 });

            (repo.findAll as jest.Mock).mockResolvedValue(expected);

            const result = await service.findCrops(dto);

            expect(repo.findAll).toHaveBeenCalledWith(dto);
            expect(result).toEqual(expected);
        });

        it('should handle empty result set', async () => {
            const dto = createFindAllDto();
            const expected = createFindAllRespDto({
                items: [],
                total: 0,
                totalPages: 0,
            });

            (repo.findAll as jest.Mock).mockResolvedValue(expected);

            const result = await service.findCrops(dto);

            expect(repo.findAll).toHaveBeenCalledWith(dto);
            expect(result).toEqual(expected);
        });
    });
});