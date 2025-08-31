import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Producer } from 'src/producers/producer.entity';
import { Property } from './property.entity';
import { ProducersService } from '../producers/producers.service';
import { PropertyRepository } from './repositories/implementation/property.repository';
import { PropertiesService } from './properties.service';
import { IPropertyRepository } from './repositories/property-repository.interface';
import { AreaValidate } from '../utils/area-validate.util';
import { FindAllPropertiesDto } from './dtos/find-all-properties.dto';
import { PropertyOrderByEnum } from './enum/property-order-by.enum';
import { FindAllPropertiesRespDto } from './dtos/find-all-properties-resp.dto';

describe('PropertiesService', () => {
    let service: PropertiesService;
    let repo: jest.Mocked<IPropertyRepository>;
    let producersService: { findProducerById: jest.Mock };
    let validateAreasSpy: jest.SpiedFunction<typeof AreaValidate.validateAreas>;

    const makeRepoMock = (): jest.Mocked<IPropertyRepository> => ({
        create: jest.fn(),
        update: jest.fn(),
        findById: jest.fn(),
        findAll: jest.fn(),
        delete: jest.fn(),
    });

    beforeEach(async () => {
        repo = makeRepoMock();
        producersService = {
            findProducerById: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PropertiesService,
                { provide: PropertyRepository, useValue: repo },
                { provide: ProducersService, useValue: producersService },
            ],
        }).compile();

        service = module.get(PropertiesService);
        jest.clearAllMocks();

        validateAreasSpy = jest
            .spyOn(AreaValidate, 'validateAreas')
            .mockImplementation(() => undefined as any);
    });

    afterEach(() => {
        validateAreasSpy.mockReset();
        validateAreasSpy.mockRestore();
    });

    describe('createPorperty', () => {
        it('should throw BadRequestException when arableAreaHa + vegetationAreaHa exceeds totalAreaHa', async () => {
            const payload = {
                producerId: '0bf1b1e7-6a9d-44a7-8f97-9a2b0a8e0c1a',
                name: 'Farm',
                city: 'City',
                state: 'ST',
                totalAreaHa: 1500.0 as any as string,
                arableAreaHa: 1000.0 as any as string,
                vegetationAreaHa: 600.0 as any as string,
                complement: 'Shed',
                latitude: '-12.500000',
                longitude: '-55.700000',
                cep: '78555000',
            };

            const act = () => service.createPorperty(payload);

            await expect(act()).rejects.toMatchObject(
                new BadRequestException(
                    'The sum of arable area and vegetation area cannot exceed the total area',
                ),
            );

            expect(producersService.findProducerById).not.toHaveBeenCalled();
            expect(repo.create).not.toHaveBeenCalled();
        });

        it('should accept when arableAreaHa + vegetationAreaHa equals totalAreaHa', async () => {
            const producer: Producer = {
                id: 'p-123',
                documentType: 0 as any,
                document: '00000000000',
                name: 'Producer X',
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null as any,
                properties: [] as any,
            };

            producersService.findProducerById.mockResolvedValue(producer);

            const payload = {
                producerId: producer.id,
                name: 'Fazenda Boa',
                city: 'Sorriso',
                state: 'MT',
                totalAreaHa: 1500.5 as any as string,
                arableAreaHa: 1000.0 as any as string,
                vegetationAreaHa: 500.5 as any as string,
                cep: '78555000',
                complement: 'Galpão 3',
                latitude: '-12.546789',
                longitude: '-55.721234',
            };

            const created: Property = {
                id: 'prop-123',
                producer,
                name: payload.name,
                city: payload.city,
                state: payload.state,
                totalAreaHa: payload.totalAreaHa,
                arableAreaHa: payload.arableAreaHa,
                vegetationAreaHa: payload.vegetationAreaHa,
                cep: payload.cep,
                complement: payload.complement,
                latitude: payload.latitude,
                longitude: payload.longitude,
                propertyCrops: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
            };

            (repo.create as jest.Mock).mockResolvedValue(created);

            const result = await service.createPorperty(payload);

            expect(producersService.findProducerById).toHaveBeenCalledWith(payload.producerId);
            expect(repo.create).toHaveBeenCalledWith({
                producer,
                name: payload.name,
                city: payload.city,
                state: payload.state,
                totalAreaHa: payload.totalAreaHa,
                arableAreaHa: payload.arableAreaHa,
                vegetationAreaHa: payload.vegetationAreaHa,
                complement: payload.complement,
                latitude: payload.latitude,
                longitude: payload.longitude,
                cep: payload.cep,
            });

            expect(result).toEqual({
                id: created.id,
                name: created.name,
            });
        });

        it('should create property with minimal required fields and return id and name', async () => {
            const producer: Producer = {
                id: 'p-456',
                documentType: 0 as any,
                document: '11111111111',
                name: 'Producer Y',
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null as any,
                properties: [] as any,
            };

            producersService.findProducerById.mockResolvedValue(producer);

            const payload = {
                producerId: producer.id,
                name: 'Fazenda Minimal',
                city: 'Sinop',
                state: 'MT',
                totalAreaHa: 100.0 as any as string,
                arableAreaHa: 60.0 as any as string,
                vegetationAreaHa: 40.0 as any as string,
            };

            const created: Property = {
                id: 'prop-456',
                producer,
                name: payload.name,
                city: payload.city,
                state: payload.state,
                totalAreaHa: payload.totalAreaHa,
                arableAreaHa: payload.arableAreaHa,
                vegetationAreaHa: payload.vegetationAreaHa,
                cep: null,
                complement: null,
                latitude: null,
                longitude: null,
                propertyCrops: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
            };

            (repo.create as jest.Mock).mockResolvedValue(created);

            const result = await service.createPorperty(payload as any);

            expect(producersService.findProducerById).toHaveBeenCalledWith(payload.producerId);
            expect(repo.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    producer,
                    name: payload.name,
                    city: payload.city,
                    state: payload.state,
                    totalAreaHa: payload.totalAreaHa,
                    arableAreaHa: payload.arableAreaHa,
                    vegetationAreaHa: payload.vegetationAreaHa,
                }),
            );

            expect(result).toEqual({ id: created.id, name: created.name });
        });

        it('should propagate NotFoundException when producer does not exist (verifies producersService usage)', async () => {
            const payload = {
                producerId: 'deadbeef-dead-beef-dead-beefdeadbeef',
                name: 'Any Farm',
                city: 'Any City',
                state: 'ST',
                totalAreaHa: 100 as any as string,
                arableAreaHa: 60 as any as string,
                vegetationAreaHa: 40 as any as string,
            };

            producersService.findProducerById.mockRejectedValue(
                new NotFoundException('Producer not found!'),
            );

            await expect(service.createPorperty(payload)).rejects.toMatchObject(
                new NotFoundException('Producer not found!'),
            );

            expect(producersService.findProducerById).toHaveBeenCalledTimes(1);
            expect(producersService.findProducerById).toHaveBeenCalledWith(payload.producerId);
            expect(repo.create).not.toHaveBeenCalled();
        });
    })


    describe('updateProperty', () => {
        const baseCurrent = (): Property => ({
            id: 'prop-0001',
            producer: { id: 'p-1' } as unknown as Producer,
            name: 'Old Farm',
            city: 'Old City',
            state: 'OS',
            totalAreaHa: '150.00',
            arableAreaHa: '90.00',
            vegetationAreaHa: '60.00',
            cep: '78555000',
            complement: 'Old Complement',
            latitude: '-12.500000',
            longitude: '-55.700000',
            propertyCrops: [],
            createdAt: new Date('2025-08-28T10:00:00.000Z'),
            updatedAt: new Date('2025-08-28T10:00:00.000Z'),
            deletedAt: null,
        });

        it('should throw NotFoundException when property does not exist', async () => {
            (repo.findById as jest.Mock).mockResolvedValue(null);

            const act = () =>
                service.updateProperty({
                    id: 'non-existent',
                    name: 'New Name',
                } as any);

            await expect(act()).rejects.toMatchObject(
                new NotFoundException('Property not found'),
            );

            expect(repo.findById).toHaveBeenCalledWith('non-existent');
            expect((AreaValidate.validateAreas as jest.Mock)).not.toHaveBeenCalled();
            expect(repo.update).not.toHaveBeenCalled();
        });

        it('should merge provided fields, validate areas, persist and return partial view', async () => {
            const current = baseCurrent();
            (repo.findById as jest.Mock).mockResolvedValue(current);

            const payload = {
                id: current.id,
                name: 'New Farm',
                state: 'NS',
                totalAreaHa: '170.00',
                arableAreaHa: '110.00',
                latitude: '-12.400000',
                longitude: undefined,
                cep: '78555999',
            };

            const expectedNext: Property = {
                ...current,
                name: 'New Farm',
                city: 'Old City',
                state: 'NS',
                totalAreaHa: '170.00',
                arableAreaHa: '110.00',
                vegetationAreaHa: '60.00',
                complement: 'Old Complement',
                latitude: '-12.400000',
                longitude: '-55.700000',
                cep: '78555999',
            } as Property;

            const saved: Property = {
                ...expectedNext,
                updatedAt: new Date('2025-08-29T12:00:00.000Z'),
            };

            (repo.update as jest.Mock).mockResolvedValue(saved);

            const result = await service.updateProperty(payload as any);

            expect(repo.findById).toHaveBeenCalledWith(current.id);
            expect(AreaValidate.validateAreas).toHaveBeenCalledWith(
                expectedNext.totalAreaHa,
                expectedNext.arableAreaHa,
                expectedNext.vegetationAreaHa,
            );
            expect(repo.update).toHaveBeenCalledWith(expect.objectContaining(expectedNext));
            expect(result).toEqual({
                id: saved.id,
                name: saved.name,
                city: saved.city,
                state: saved.state,
                totalAreaHa: saved.totalAreaHa,
                arableAreaHa: saved.arableAreaHa,
                vegetationAreaHa: saved.vegetationAreaHa,
                complement: saved.complement,
                latitude: saved.latitude,
                longitude: saved.longitude,
                cep: saved.cep,
                updatedAt: saved.updatedAt,
            });
        });

        it('should keep existing optional fields when payload has undefined and set them to null when payload has null', async () => {
            const current = {
                ...baseCurrent(),
                complement: 'Has Complement',
                latitude: '-10.000000',
                longitude: '-50.000000',
                cep: '70000000',
            };
            (repo.findById as jest.Mock).mockResolvedValue(current);

            const payloadKeep = {
                id: current.id,
                totalAreaHa: '150.00',
                arableAreaHa: '90.00',
                vegetationAreaHa: '60.00',
                complement: undefined,
                latitude: undefined,
                longitude: undefined,
                cep: undefined,
            };

            const savedKeep: Property = {
                ...current,
                updatedAt: new Date('2025-08-29T12:10:00.000Z'),
            };

            (repo.update as jest.Mock).mockResolvedValueOnce(savedKeep);

            const resultKeep = await service.updateProperty(payloadKeep as any);

            expect(AreaValidate.validateAreas).toHaveBeenCalledWith('150.00', '90.00', '60.00');
            expect(repo.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    complement: 'Has Complement',
                    latitude: '-10.000000',
                    longitude: '-50.000000',
                    cep: '70000000',
                }),
            );

            expect(resultKeep).toEqual(
                expect.objectContaining({
                    complement: 'Has Complement',
                    latitude: '-10.000000',
                    longitude: '-50.000000',
                    cep: '70000000',
                }),
            );

            (repo.findById as jest.Mock).mockResolvedValue(current);
            const payloadNull = {
                id: current.id,
                totalAreaHa: '150.00',
                arableAreaHa: '90.00',
                vegetationAreaHa: '60.00',
                complement: null,
                latitude: null,
                longitude: null,
                cep: null,
            };

            const savedNull: Property = {
                ...current,
                complement: null,
                latitude: null,
                longitude: null,
                cep: null,
                updatedAt: new Date('2025-08-29T12:11:00.000Z'),
            };

            (repo.update as jest.Mock).mockResolvedValueOnce(savedNull);

            const resultNull = await service.updateProperty(payloadNull as any);

            expect(AreaValidate.validateAreas).toHaveBeenCalledWith('150.00', '90.00', '60.00');
            expect(repo.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    complement: null,
                    latitude: null,
                    longitude: null,
                    cep: null,
                }),
            );

            expect(resultNull).toEqual(
                expect.objectContaining({
                    complement: null,
                    latitude: null,
                    longitude: null,
                    cep: null,
                }),
            );
        });

        it('should propagate BadRequestException from AreaValidate and not update', async () => {
            const current = baseCurrent();
            (repo.findById as jest.Mock).mockResolvedValue(current);

            (AreaValidate.validateAreas as jest.Mock).mockImplementation(() => {
                throw new BadRequestException(
                    'The sum of arable area and vegetation area cannot exceed the total area',
                );
            });

            const act = () =>
                service.updateProperty({
                    id: current.id,
                    totalAreaHa: '100.00',
                    arableAreaHa: '90.00',
                    vegetationAreaHa: '20.00',
                } as any);

            await expect(act()).rejects.toMatchObject(
                new BadRequestException(
                    'The sum of arable area and vegetation area cannot exceed the total area',
                ),
            );

            expect(repo.update).not.toHaveBeenCalled();
        });

        it('should validate areas using current values when area fields are not provided', async () => {
            const current = baseCurrent();
            (repo.findById as jest.Mock).mockResolvedValue(current);

            const saved: Property = {
                ...current,
                name: 'Same Areas',
                updatedAt: new Date('2025-08-29T12:20:00.000Z'),
            };
            (repo.update as jest.Mock).mockResolvedValue(saved);

            const result = await service.updateProperty({
                id: current.id,
                name: 'Same Areas'
            } as any);

            expect(AreaValidate.validateAreas).toHaveBeenCalledWith(
                current.totalAreaHa,
                current.arableAreaHa,
                current.vegetationAreaHa,
            );

            expect(repo.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    totalAreaHa: current.totalAreaHa,
                    arableAreaHa: current.arableAreaHa,
                    vegetationAreaHa: current.vegetationAreaHa,
                }),
            );

            expect(result).toEqual(
                expect.objectContaining({
                    id: current.id,
                    name: 'Same Areas',
                    totalAreaHa: current.totalAreaHa,
                    arableAreaHa: current.arableAreaHa,
                    vegetationAreaHa: current.vegetationAreaHa,
                }),
            );
        });

        it('should set optional fields to null when current is undefined and payload is undefined (fallback ?? null)', async () => {
            const current = {
                ...baseCurrent(),
                complement: undefined,
                latitude: undefined,
                longitude: undefined,
                cep: undefined,
            } as unknown as Property;

            (repo.findById as jest.Mock).mockResolvedValue(current);

            const payload = {
                id: current.id,
                complement: undefined,
                latitude: undefined,
                longitude: undefined,
                cep: undefined
            };

            const saved: Property = {
                ...current,
                complement: null,
                latitude: null,
                longitude: null,
                cep: null,
                updatedAt: new Date('2025-08-29T13:30:00.000Z')
            };
            (repo.update as jest.Mock).mockResolvedValue(saved);

            const result = await service.updateProperty(payload as any);

            expect(AreaValidate.validateAreas).toHaveBeenCalledWith(
                current.totalAreaHa,
                current.arableAreaHa,
                current.vegetationAreaHa
            );

            expect(repo.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    complement: null,
                    latitude: null,
                    longitude: null,
                    cep: null,
                }),
            );

            expect(result).toEqual(
                expect.objectContaining({
                    complement: null,
                    latitude: null,
                    longitude: null,
                    cep: null,
                }),
            );
        });

        it('should overwrite all optional fields when they are provided', async () => {
            const current = {
                ...baseCurrent(),
                complement: 'Old',
                latitude: '-12.000001',
                longitude: '-55.000001',
                cep: '70000000',
            };
            (repo.findById as jest.Mock).mockResolvedValue(current);

            const payload = {
                id: current.id,
                totalAreaHa: current.totalAreaHa,
                arableAreaHa: current.arableAreaHa,
                vegetationAreaHa: current.vegetationAreaHa,
                complement: 'New Complement',
                latitude: '-11.111111',
                longitude: '-54.222222',
                cep: '78555999',
            };

            const saved: Property = {
                ...current,
                complement: payload.complement,
                latitude: payload.latitude,
                longitude: payload.longitude,
                cep: payload.cep,
                updatedAt: new Date('2025-08-29T13:40:00.000Z'),
            };
            (repo.update as jest.Mock).mockResolvedValue(saved);

            const result = await service.updateProperty(payload as any);

            expect(AreaValidate.validateAreas).toHaveBeenCalledWith(
                current.totalAreaHa,
                current.arableAreaHa,
                current.vegetationAreaHa
            );

            expect(repo.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    complement: 'New Complement',
                    latitude: '-11.111111',
                    longitude: '-54.222222',
                    cep: '78555999'
                }),
            );

            expect(result).toEqual(
                expect.objectContaining({
                    complement: 'New Complement',
                    latitude: '-11.111111',
                    longitude: '-54.222222',
                    cep: '78555999'
                }),
            );
        });

    });

    describe('getPropertyById', () => {
        it('should throw BadRequestException when id is empty', async () => {
            const id = '';
            const act = () => service.getPropertyById(id);

            await expect(act()).rejects.toMatchObject(
                new BadRequestException('Id is required'),
            );

            expect(repo.findById).not.toHaveBeenCalled();
        });

        it('should throw NotFoundException when property does not exist', async () => {
            const id = '11111111-1111-1111-1111-111111111111';
            (repo.findById as jest.Mock).mockResolvedValue(null);

            const act = () => service.getPropertyById(id);

            await expect(act()).rejects.toMatchObject(
                new NotFoundException('Property not found'),
            );

            expect(repo.findById).toHaveBeenCalledWith(id);
        });

        it('should return property when it exists', async () => {
            const id = '22222222-2222-2222-2222-222222222222';
            const property = {
                id,
                name: 'Fazenda XPTO',
                city: 'Sorriso',
                state: 'MT',
                totalAreaHa: '100.00',
                arableAreaHa: '60.00',
                vegetationAreaHa: '40.00',
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
            } as unknown as Property;

            (repo.findById as jest.Mock).mockResolvedValue(property);

            const result = await service.getPropertyById(id);

            expect(repo.findById).toHaveBeenCalledWith(id);
            expect(result).toBe(property);
        });
    });

    describe('getProperty', () => {
        it('should delegate to repo.findAll with given filters and return paginated result', async () => {
            const dto: FindAllPropertiesDto = {
                order: 'ASC',
                page: 2,
                limit: 5,
                orderBy: PropertyOrderByEnum.NAME,
            };

            const producer: Producer = {
                id: 'p-1',
                documentType: 0 as any,
                document: '00000000000',
                name: 'Producer',
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null as any,
                properties: [] as any,
            };

            const item: Property = {
                id: 'prop-1',
                producer,
                name: 'Farm A',
                city: 'City A',
                state: 'ST',
                totalAreaHa: '100.00',
                arableAreaHa: '60.00',
                vegetationAreaHa: '40.00',
                cep: '70000000',
                complement: null,
                latitude: null,
                longitude: null,
                propertyCrops: [],
                createdAt: new Date('2025-08-29T10:00:00.000Z'),
                updatedAt: new Date('2025-08-29T10:00:00.000Z'),
                deletedAt: null,
            };

            const paged: FindAllPropertiesRespDto = {
                items: [item],
                total: 1,
                totalPages: 1,
                page: 2,
                limit: 5,
                order: 'ASC',
                orderBy: PropertyOrderByEnum.NAME,
            };

            (repo.findAll as jest.Mock).mockResolvedValue(paged);

            const result = await service.getProperty(dto);

            expect(repo.findAll).toHaveBeenCalledTimes(1);
            expect(repo.findAll).toHaveBeenCalledWith(dto);
            expect(result).toEqual(paged);
        });

        it('should call repo.findAll with empty object to rely on repository defaults', async () => {
            const paged: FindAllPropertiesRespDto = {
                items: [],
                total: 0,
                totalPages: 0,
                page: 1,
                limit: 10,
                order: 'DESC',
                orderBy: PropertyOrderByEnum.CREATED_AT,
            };

            (repo.findAll as jest.Mock).mockResolvedValue(paged);

            const result = await service.getProperty({} as any);

            expect(repo.findAll).toHaveBeenCalledWith({});
            expect(result).toEqual(paged);
        });

        it('should propagate repository errors', async () => {
            const dto: FindAllPropertiesDto = {
                order: 'DESC',
                page: 1,
                limit: 10,
                orderBy: PropertyOrderByEnum.CREATED_AT,
            };

            (repo.findAll as jest.Mock).mockRejectedValue(new Error('db boom'));

            await expect(service.getProperty(dto)).rejects.toThrow('db boom');
            expect(repo.findAll).toHaveBeenCalledWith(dto);
        });
    });

    describe('deleteProperty', () => {
        it('should throw BadRequestException when id is empty', async () => {
            const id = '';
            const act = () => service.deleteProperty(id);

            await expect(act()).rejects.toMatchObject(
                new BadRequestException('Id is required'),
            );

            expect(repo.findById).not.toHaveBeenCalled();
            expect(repo.delete).not.toHaveBeenCalled();
        });

        it('should throw NotFoundException when property does not exist', async () => {
            const id = '33333333-3333-3333-3333-333333333333';
            (repo.findById as jest.Mock).mockResolvedValue(null);

            const act = () => service.deleteProperty(id);

            await expect(act()).rejects.toMatchObject(
                new NotFoundException('Property not found'),
            );

            expect(repo.findById).toHaveBeenCalledWith(id);
            expect(repo.delete).not.toHaveBeenCalled();
        });

        it('should delete property when it exists', async () => {
            const id = '44444444-4444-4444-4444-444444444444';
            (repo.findById as jest.Mock).mockResolvedValue({ id } as Property);
            (repo.delete as jest.Mock).mockResolvedValue(undefined);

            await expect(service.deleteProperty(id)).resolves.toBeUndefined();

            expect(repo.findById).toHaveBeenCalledWith(id);
            expect(repo.delete).toHaveBeenCalledWith(id);
        });
    });
});