import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { CropsService } from './crops.service';
import type { ICropRepository } from './repositories/crop-repository.interface';
import { CropRepository } from './repositories/implementation/crop.repository';
import { Crop } from './crop.entity';

describe('CropsService - create', () => {
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
});