import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';

import { PropertyCropService } from '../property-crops/property-crops.service';
import { PropertyCropRepository } from './repositories/implementation/property-crop.repository';
import type { IPropertycropRepository } from './repositories/property-crop-repository.interface';

import { PropertiesService } from '../properties/properties.service';
import { HarvestsService } from '../harvests/harvests.service';
import { CropsService } from '../crops/crops.service';

import { Property } from '../properties/property.entity';
import { Harvest } from '../harvests/harvest.entity';
import { Crop } from '../crops/crop.entity';
import { PropertyCrop } from './property-crop.entity';

describe('PropertyCropService', () => {
    let service: PropertyCropService;

    let repo: jest.Mocked<IPropertycropRepository>;
    let propertiesService: { getPropertyById: jest.Mock };
    let harvestsService: { findById: jest.Mock };
    let cropsService: { findById: jest.Mock };

    const makeRepoMock = (): jest.Mocked<IPropertycropRepository> => ({
        create: jest.fn(),
        findById: jest.fn(),
        findAll: jest.fn(),
        delete: jest.fn(),
    });

    beforeEach(async () => {
        repo = makeRepoMock();
        propertiesService = { getPropertyById: jest.fn() };
        harvestsService = { findById: jest.fn() };
        cropsService = { findById: jest.fn() };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PropertyCropService,
                { provide: PropertyCropRepository, useValue: repo },
                { provide: PropertiesService, useValue: propertiesService },
                { provide: HarvestsService, useValue: harvestsService },
                { provide: CropsService, useValue: cropsService },
            ],
        }).compile();

        service = module.get(PropertyCropService);
        jest.clearAllMocks();
    });

    describe('createPropertyCrop', () => {
        it('should propagate NotFoundException when property does not exist', async () => {
            const payload = {
                propertyId: 'prop-404',
                harvestId: 'harv-1',
                cropId: 'crop-1',
            };

            propertiesService.getPropertyById.mockRejectedValue(
                new NotFoundException('Property not found'),
            );

            const act = () => service.createPropertyCrop(payload as any);

            await expect(act()).rejects.toMatchObject(
                new NotFoundException('Property not found'),
            );

            expect(propertiesService.getPropertyById).toHaveBeenCalledWith(payload.propertyId);
            expect(harvestsService.findById).not.toHaveBeenCalled();
            expect(cropsService.findById).not.toHaveBeenCalled();
            expect(repo.create).not.toHaveBeenCalled();
        });

        it('should propagate NotFoundException when harvest does not exist', async () => {
            const property: Property = {
                id: 'prop-1',
                producer: {} as any,
                name: 'Farm A',
                city: 'City',
                state: 'ST',
                totalAreaHa: '100.00' as any,
                arableAreaHa: '60.00' as any,
                vegetationAreaHa: '40.00' as any,
                cep: null as any,
                complement: null as any,
                latitude: null as any,
                longitude: null as any,
                propertyCrops: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
            };

            propertiesService.getPropertyById.mockResolvedValue(property);
            harvestsService.findById.mockRejectedValue(
                new NotFoundException('Harvest not found'),
            );

            const payload = {
                propertyId: property.id,
                harvestId: 'harv-404',
                cropId: 'crop-1',
            };

            const act = () => service.createPropertyCrop(payload as any);

            await expect(act()).rejects.toMatchObject(
                new NotFoundException('Harvest not found'),
            );

            expect(propertiesService.getPropertyById).toHaveBeenCalledWith(payload.propertyId);
            expect(harvestsService.findById).toHaveBeenCalledWith(payload.harvestId);
            expect(cropsService.findById).not.toHaveBeenCalled();
            expect(repo.create).not.toHaveBeenCalled();
        });

        it('should propagate NotFoundException when crop does not exist', async () => {
            const property: Property = { id: 'prop-1' } as Property;
            const harvest: Harvest = { id: 'harv-1' } as Harvest;

            propertiesService.getPropertyById.mockResolvedValue(property);
            harvestsService.findById.mockResolvedValue(harvest);
            cropsService.findById.mockRejectedValue(
                new NotFoundException('Crop not found'),
            );

            const payload = {
                propertyId: property.id,
                harvestId: harvest.id,
                cropId: 'crop-404',
            };

            const act = () => service.createPropertyCrop(payload as any);

            await expect(act()).rejects.toMatchObject(
                new NotFoundException('Crop not found'),
            );

            expect(propertiesService.getPropertyById).toHaveBeenCalledWith(payload.propertyId);
            expect(harvestsService.findById).toHaveBeenCalledWith(payload.harvestId);
            expect(cropsService.findById).toHaveBeenCalledWith(payload.cropId);
            expect(repo.create).not.toHaveBeenCalled();
        });

        it('should create property-crop relation and return the created entity', async () => {
            const property: Property = {
                id: 'prop-1',
            } as Property;

            const harvest: Harvest = {
                id: 'harv-1',
            } as Harvest;

            const crop: Crop = {
                id: 'crop-1',
            } as Crop;

            const created: PropertyCrop = {
                id: 'pc-1',
                property,
                harvest,
                crop,
                createdAt: new Date('2025-08-29T10:00:00.000Z'),
                updatedAt: new Date('2025-08-29T10:00:00.000Z'),
                deletedAt: null,
            } as PropertyCrop;

            propertiesService.getPropertyById.mockResolvedValue(property);
            harvestsService.findById.mockResolvedValue(harvest);
            cropsService.findById.mockResolvedValue(crop);

            (repo.create as jest.Mock).mockResolvedValue(created);

            const payload = {
                propertyId: property.id,
                harvestId: harvest.id,
                cropId: crop.id,
            };

            const result = await service.createPropertyCrop(payload as any);

            expect(propertiesService.getPropertyById).toHaveBeenCalledWith(payload.propertyId);
            expect(harvestsService.findById).toHaveBeenCalledWith(payload.harvestId);
            expect(cropsService.findById).toHaveBeenCalledWith(payload.cropId);

            expect(repo.create).toHaveBeenCalledWith({
                property,
                harvest,
                crop,
            });

            expect(result).toBe(created);
        });

        it('should throw NotFoundException when property is falsy (null/undefined)', async () => {
            const payload = { propertyId: 'prop-1', harvestId: 'harv-1', cropId: 'crop-1' };

            (propertiesService.getPropertyById as jest.Mock).mockResolvedValue(null);

            const act = () => service.createPropertyCrop(payload as any);

            await expect(act()).rejects.toMatchObject(new NotFoundException('Property not found'));

            expect(propertiesService.getPropertyById).toHaveBeenCalledWith(payload.propertyId);
            expect(harvestsService.findById).not.toHaveBeenCalled();
            expect(cropsService.findById).not.toHaveBeenCalled();
            expect(repo.create).not.toHaveBeenCalled();
        });

        it('should throw NotFoundException when harvest is falsy (null/undefined)', async () => {
            const payload = { propertyId: 'prop-1', harvestId: 'harv-1', cropId: 'crop-1' };

            (propertiesService.getPropertyById as jest.Mock).mockResolvedValue({ id: payload.propertyId } as any);
            (harvestsService.findById as jest.Mock).mockResolvedValue(null);

            const act = () => service.createPropertyCrop(payload as any);

            await expect(act()).rejects.toMatchObject(new NotFoundException('Harvest not found'));

            expect(propertiesService.getPropertyById).toHaveBeenCalledWith(payload.propertyId);
            expect(harvestsService.findById).toHaveBeenCalledWith(payload.harvestId);
            expect(cropsService.findById).not.toHaveBeenCalled();
            expect(repo.create).not.toHaveBeenCalled();
        });

        it('should throw NotFoundException when crop is falsy (null/undefined)', async () => {
            const payload = { propertyId: 'prop-1', harvestId: 'harv-1', cropId: 'crop-1' };

            (propertiesService.getPropertyById as jest.Mock).mockResolvedValue({ id: payload.propertyId } as any);
            (harvestsService.findById as jest.Mock).mockResolvedValue({ id: payload.harvestId } as any);
            (cropsService.findById as jest.Mock).mockResolvedValue(null);

            const act = () => service.createPropertyCrop(payload as any);

            await expect(act()).rejects.toMatchObject(new NotFoundException('Crop not found'));

            expect(propertiesService.getPropertyById).toHaveBeenCalledWith(payload.propertyId);
            expect(harvestsService.findById).toHaveBeenCalledWith(payload.harvestId);
            expect(cropsService.findById).toHaveBeenCalledWith(payload.cropId);
            expect(repo.create).not.toHaveBeenCalled();
        });
    });

    describe('getPropertyById', () => {
        it('should throw BadRequestException when id is empty', async () => {
            const act = () => service.getPropertyById('');

            await expect(act()).rejects.toMatchObject(
                new BadRequestException('Id is required'),
            );
            expect(repo.findById).not.toHaveBeenCalled();
        });

        it('should throw NotFoundException when propertyCrop does not exist', async () => {
            const id = 'fake-id';
            (repo.findById as jest.Mock).mockResolvedValue(null);

            const act = () => service.getPropertyById(id);

            await expect(act()).rejects.toMatchObject(
                new NotFoundException('Property crop not found'),
            );
            expect(repo.findById).toHaveBeenCalledWith(id);
        });

        it('should return propertyCrop when it exists', async () => {
            const id = 'valid-id';
            const propertyCrop = { id } as unknown as PropertyCrop;
            (repo.findById as jest.Mock).mockResolvedValue(propertyCrop);

            const result = await service.getPropertyById(id);

            expect(repo.findById).toHaveBeenCalledWith(id);
            expect(result).toBe(propertyCrop);
        });
    });

    describe('getAllProperties', () => {
        it('should return empty array when no propertyCrops exist', async () => {
            (repo.findAll as jest.Mock).mockResolvedValue([]);

            const result = await service.getAllProperties();

            expect(repo.findAll).toHaveBeenCalled();
            expect(result).toEqual([]);
        });

        it('should return array of propertyCrops when they exist', async () => {
            const propertyCrops = [
                { id: 'pc-1' } as PropertyCrop,
                { id: 'pc-2' } as PropertyCrop,
            ];
            (repo.findAll as jest.Mock).mockResolvedValue(propertyCrops);

            const result = await service.getAllProperties();

            expect(repo.findAll).toHaveBeenCalled();
            expect(result).toBe(propertyCrops);
        });
    });

    describe('deleteProperty', () => {
        it('should throw BadRequestException when id is empty', async () => {
            const act = () => service.deleteProperty('');

            await expect(act()).rejects.toMatchObject(
                new BadRequestException('Id is required'),
            );
            expect(repo.findById).not.toHaveBeenCalled();
            expect(repo.delete).not.toHaveBeenCalled();
        });

        it('should throw NotFoundException when propertyCrop does not exist', async () => {
            const id = 'not-found-id';
            (repo.findById as jest.Mock).mockResolvedValue(null);

            const act = () => service.deleteProperty(id);

            await expect(act()).rejects.toMatchObject(
                new NotFoundException('Property crop not found'),
            );
            expect(repo.findById).toHaveBeenCalledWith(id);
            expect(repo.delete).not.toHaveBeenCalled();
        });

        it('should delete propertyCrop when it exists', async () => {
            const id = 'valid-id';
            (repo.findById as jest.Mock).mockResolvedValue({ id } as PropertyCrop);
            (repo.delete as jest.Mock).mockResolvedValue(undefined);

            await expect(service.deleteProperty(id)).resolves.toBeUndefined();

            expect(repo.findById).toHaveBeenCalledWith(id);
            expect(repo.delete).toHaveBeenCalledWith(id);
        });
    });
});