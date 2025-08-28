import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ProducersService } from './producers.service';
import { IProducerRepository } from './repositories/producer-repository.interface';
import { Producer } from './producer.entity';
import { ProducerRepository } from './repositories/implementation/producer.repository';
import { DocumentValidator } from '../utils/document-validator.util';
import { DocumentType } from '../shared/enums/document-type.enum'

jest.mock('../utils/document-validator.util', () => ({
    DocumentValidator: {
        validate: jest.fn(),
    },
}));

describe('ProducersService', () => {
    let service: ProducersService;
    let repo: jest.Mocked<IProducerRepository>;

    const makeRepoMock = (): jest.Mocked<IProducerRepository> => ({
        create: jest.fn(),
        update: jest.fn(),
        getById: jest.fn(),
        getByDocument: jest.fn(),
        getAll: jest.fn(),
        getByName: jest.fn(),
        softDelete: jest.fn(),
    });

    beforeEach(async () => {
        repo = makeRepoMock();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProducersService,
                { provide: ProducerRepository, useValue: repo },
            ],
        }).compile();

        service = module.get(ProducersService);
        jest.clearAllMocks();
    });

    describe('createProducer', () => {
        it('should create a producer when name and document are unique', async () => {
            const payload = { document: '12345678901', name: 'John Doe' };
            (repo.getByName as jest.Mock).mockResolvedValue(null);
            (repo.getByDocument as jest.Mock).mockResolvedValue(null);

            (DocumentValidator.validate as jest.Mock).mockReturnValue(DocumentType.CPF);

            const created: Producer = {
                id: 'a3e6b7f4-8a27-4fd5-9f9a-8a8a8a8a8a8a',
                documentType: DocumentType.CPF,
                document: payload.document,
                name: payload.name,
                created_at: new Date(),
                updated_at: new Date(),
                deleted_at: null as any,
            };

            (repo.create as jest.Mock).mockResolvedValue(created);

            const result = await service.createProducer(payload);

            expect(repo.getByName).toHaveBeenCalledWith(payload.name);
            expect(repo.getByDocument).toHaveBeenCalledWith(payload.document);
            expect(DocumentValidator.validate).toHaveBeenCalledWith(payload.document);

            expect(repo.create).toHaveBeenCalledWith({
                documentType: DocumentType.CPF,
                document: payload.document,
                name: payload.name,
            });

            expect(result).toEqual({
                id: created.id,
                name: created.name,
            });
        });

        it('should throw BadRequestException when producer name already exists', async () => {
            const payload = { document: '12345678901', name: 'John Doe' };
            (repo.getByName as jest.Mock).mockResolvedValue({
                id: 'existing-id',
                name: payload.name,
            } as unknown as Producer);

            const act = () => service.createProducer(payload);

            await expect(act()).rejects.toMatchObject(
                new BadRequestException('Producer name already exists'),
            );
            expect(repo.getByName).toHaveBeenCalledWith(payload.name);

            expect(repo.getByDocument).not.toHaveBeenCalled();
            expect(repo.create).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException when producer document already exists', async () => {
            const payload = { document: '12345678901', name: 'John Doe' };
            (repo.getByName as jest.Mock).mockResolvedValue(null);
            (repo.getByDocument as jest.Mock).mockResolvedValue({
                id: 'existing-id',
                document: payload.document,
            } as unknown as Producer);

            const act = () => service.createProducer(payload);

            await expect(act()).rejects.toMatchObject(
                new BadRequestException('Producer document already exists'),
            );
            expect(repo.getByName).toHaveBeenCalledWith(payload.name);
            expect(repo.getByDocument).toHaveBeenCalledWith(payload.document);

            expect(DocumentValidator.validate).not.toHaveBeenCalled();
            expect(repo.create).not.toHaveBeenCalled();
        });
    })

    describe('deleteProducer', () => {
        it('should throw BadRequestException when id is empty', async () => {
            const id = '';
            const act = () => service.deleteProducer(id);

            await expect(act()).rejects.toMatchObject(
                new BadRequestException('Id is required!'),
            );

            expect(repo.getById).not.toHaveBeenCalled();
            expect(repo.softDelete).not.toHaveBeenCalled();
        });

        it('should throw NotFoundException when producer does not exist', async () => {
            const id = '2b1b6d1f-1c1a-4a6a-9a12-111111111111';
            (repo.getById as jest.Mock).mockResolvedValue(null);

            const act = () => service.deleteProducer(id);

            await expect(act()).rejects.toMatchObject(
                new NotFoundException('Producer not found!'),
            );

            expect(repo.getById).toHaveBeenCalledWith(id);
            expect(repo.softDelete).not.toHaveBeenCalled();
        });

        it('should soft delete producer when it exists', async () => {
            const id = '7c5c0c3e-4d8b-4f0c-8a0c-222222222222';
            (repo.getById as jest.Mock).mockResolvedValue({ id } as Producer);
            (repo.softDelete as jest.Mock).mockResolvedValue(undefined);

            await expect(service.deleteProducer(id)).resolves.toBeUndefined();

            expect(repo.getById).toHaveBeenCalledWith(id);
            expect(repo.softDelete).toHaveBeenCalledWith(id);
        });
    });

    describe('updateProducer', () => {
        const baseProducer: Producer = {
            id: '11111111-1111-1111-1111-111111111111',
            documentType: DocumentType.CPF,
            document: '12345678901',
            name: 'Old Name',
            created_at: new Date(),
            updated_at: new Date(),
            deleted_at: null as any,
        };

        it('should throw BadRequestException when id is empty', async () => {
            const payload = { id: '', name: 'Any', document: '98765432100' };
            const act = () => service.updateProducer(payload as any);

            await expect(act()).rejects.toMatchObject(
                new BadRequestException('Id is required!'),
            );

            expect(repo.getById).not.toHaveBeenCalled();
            expect(repo.update).not.toHaveBeenCalled();
        });

        it('should throw NotFoundException when producer does not exist', async () => {
            const id = '22222222-2222-2222-2222-222222222222';
            (repo.getById as jest.Mock).mockResolvedValue(null);

            const act = () => service.updateProducer({ id, name: 'New', document: '98765432100' } as any);

            await expect(act()).rejects.toMatchObject(
                new NotFoundException('Producer not found!'),
            );

            expect(repo.getById).toHaveBeenCalledWith(id);
            expect(repo.update).not.toHaveBeenCalled();
        });

        it('should update only name when it changes and is unique', async () => {
            (repo.getById as jest.Mock).mockResolvedValue({ ...baseProducer });
            (repo.getByName as jest.Mock).mockResolvedValue(null);

            const updated: Producer = { ...baseProducer, name: 'New Name' };
            (repo.update as jest.Mock).mockResolvedValue(updated);

            const result = await service.updateProducer({ id: baseProducer.id, name: 'New Name' } as any);

            expect(repo.getById).toHaveBeenCalledWith(baseProducer.id);
            expect(repo.getByName).toHaveBeenCalledWith('New Name');

            expect(repo.getByDocument).not.toHaveBeenCalled();
            expect(DocumentValidator.validate).not.toHaveBeenCalled();

            expect(repo.update).toHaveBeenCalledWith(expect.objectContaining({ name: 'New Name' }));
            expect(result).toEqual(updated);
        });

        it('should update only document when it changes and is unique', async () => {
            (repo.getById as jest.Mock).mockResolvedValue({ ...baseProducer });
            (repo.getByDocument as jest.Mock).mockResolvedValue(null);

            (DocumentValidator.validate as jest.Mock).mockReturnValue(DocumentType.CNPJ);

            const newDocument = '11222333000181';
            const updated: Producer = {
                ...baseProducer,
                document: newDocument,
                documentType: DocumentType.CNPJ,
            };
            (repo.update as jest.Mock).mockResolvedValue(updated);

            const result = await service.updateProducer({ id: baseProducer.id, document: newDocument } as any);

            expect(repo.getById).toHaveBeenCalledWith(baseProducer.id);
            expect(repo.getByDocument).toHaveBeenCalledWith(newDocument);
            expect(DocumentValidator.validate).toHaveBeenCalledWith(newDocument);

            expect(repo.getByName).not.toHaveBeenCalled();

            expect(repo.update).toHaveBeenCalledWith(
                expect.objectContaining({ document: newDocument, documentType: DocumentType.CNPJ }),
            );
            expect(result).toEqual(updated);
        });

        it('should not check duplicates or validate when document is equal to current', async () => {
            (repo.getById as jest.Mock).mockResolvedValue({ ...baseProducer });

            const updated: Producer = { ...baseProducer };
            (repo.update as jest.Mock).mockResolvedValue(updated);

            const result = await service.updateProducer({ id: baseProducer.id, document: baseProducer.document } as any);

            expect(repo.getById).toHaveBeenCalledWith(baseProducer.id);

            expect(repo.getByDocument).not.toHaveBeenCalled();
            expect(DocumentValidator.validate).not.toHaveBeenCalled();

            expect(repo.update).toHaveBeenCalledWith(expect.objectContaining({ document: baseProducer.document }));
            expect(result).toEqual(updated);
        });

        it('should not check duplicates when name is equal to current', async () => {
            (repo.getById as jest.Mock).mockResolvedValue({ ...baseProducer });

            const updated: Producer = { ...baseProducer };
            (repo.update as jest.Mock).mockResolvedValue(updated);

            const result = await service.updateProducer({ id: baseProducer.id, name: baseProducer.name } as any);

            expect(repo.getById).toHaveBeenCalledWith(baseProducer.id);

            expect(repo.getByName).not.toHaveBeenCalled();

            expect(repo.update).toHaveBeenCalledWith(expect.objectContaining({ name: baseProducer.name }));
            expect(result).toEqual(updated);
        });

        it('should throw BadRequestException when new document already exists', async () => {
            (repo.getById as jest.Mock).mockResolvedValue({ ...baseProducer });

            const newDocument = '11222333000181';
            (repo.getByDocument as jest.Mock).mockResolvedValue({ id: 'exists' } as Producer);

            const act = () => service.updateProducer({ id: baseProducer.id, document: newDocument } as any);

            await expect(act()).rejects.toMatchObject(
                new BadRequestException('Producer document already exists'),
            );

            expect(repo.getByDocument).toHaveBeenCalledWith(newDocument);
            expect(DocumentValidator.validate).not.toHaveBeenCalled();
            expect(repo.update).not.toHaveBeenCalled();
        });

        it('should throw BadRequestException when new name already exists', async () => {
            (repo.getById as jest.Mock).mockResolvedValue({ ...baseProducer });

            (repo.getByName as jest.Mock).mockResolvedValue({ id: 'exists' } as Producer);

            const act = () => service.updateProducer({ id: baseProducer.id, name: 'Taken Name' } as any);

            await expect(act()).rejects.toMatchObject(
                new BadRequestException('Producer name already exists'),
            );

            expect(repo.getByName).toHaveBeenCalledWith('Taken Name');
            expect(repo.update).not.toHaveBeenCalled();
        });

        it('should update both name and document when both change and are unique', async () => {
            (repo.getById as jest.Mock).mockResolvedValue({ ...baseProducer });
            (repo.getByName as jest.Mock).mockResolvedValue(null);
            (repo.getByDocument as jest.Mock).mockResolvedValue(null);
            (DocumentValidator.validate as jest.Mock).mockReturnValue(DocumentType.CNPJ);

            const payload = {
                id: baseProducer.id,
                name: 'Brand New',
                document: '11222333000181',
            } as any;

            const updated: Producer = {
                ...baseProducer,
                name: payload.name,
                document: payload.document,
                documentType: DocumentType.CNPJ,
            };
            (repo.update as jest.Mock).mockResolvedValue(updated);

            const result = await service.updateProducer(payload);

            expect(repo.getById).toHaveBeenCalledWith(baseProducer.id);
            expect(repo.getByName).toHaveBeenCalledWith(payload.name);
            expect(repo.getByDocument).toHaveBeenCalledWith(payload.document);
            expect(DocumentValidator.validate).toHaveBeenCalledWith(payload.document);

            expect(repo.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: payload.name,
                    document: payload.document,
                    documentType: DocumentType.CNPJ,
                }),
            );
            expect(result).toEqual(updated);
        });
    });

    describe('getAllProducers', () => {
        it('should return empty array when no producers exist', async () => {
            (repo.getAll as jest.Mock).mockResolvedValue([]);

            const result = await service.getAllProducers();

            expect(repo.getAll).toHaveBeenCalled();
            expect(result).toEqual([]);
        });

        it('should return array with id and name only', async () => {
            const producers: Producer[] = [
                {
                    id: '11111111-1111-1111-1111-111111111111',
                    documentType: DocumentType.CPF,
                    document: '12345678901',
                    name: 'Alice',
                    created_at: new Date(),
                    updated_at: new Date(),
                    deleted_at: null as any,
                },
                {
                    id: '22222222-2222-2222-2222-222222222222',
                    documentType: DocumentType.CNPJ,
                    document: '11222333000181',
                    name: 'Bob',
                    created_at: new Date(),
                    updated_at: new Date(),
                    deleted_at: null as any,
                },
            ];
            (repo.getAll as jest.Mock).mockResolvedValue(producers);

            const result = await service.getAllProducers();

            expect(repo.getAll).toHaveBeenCalled();
            expect(result).toEqual([
                { id: producers[0].id, name: producers[0].name },
                { id: producers[1].id, name: producers[1].name },
            ]);

            result.forEach((item) => {
                expect(Object.keys(item)).toEqual(['id', 'name']);
            });
        });
    });

    describe('findProducerById', () => {
        it('should throw BadRequestException when id is empty', async () => {
            const id = '';
            const act = () => service.findProducerById(id);

            await expect(act()).rejects.toMatchObject(
                new BadRequestException('Id is required!'),
            );

            expect(repo.getById).not.toHaveBeenCalled();
        });

        it('should throw NotFoundException when producer does not exist', async () => {
            const id = '11111111-1111-1111-1111-111111111111';
            (repo.getById as jest.Mock).mockResolvedValue(null);

            const act = () => service.findProducerById(id);

            await expect(act()).rejects.toMatchObject(
                new NotFoundException('Producer not found!'),
            );

            expect(repo.getById).toHaveBeenCalledWith(id);
        });

        it('should return producer when it exists', async () => {
            const id = '22222222-2222-2222-2222-222222222222';
            const producer: Producer = {
                id,
                documentType: DocumentType.CPF,
                document: '12345678901',
                name: 'Alice',
                created_at: new Date(),
                updated_at: new Date(),
                deleted_at: null as any,
            };
            (repo.getById as jest.Mock).mockResolvedValue(producer);

            const result = await service.findProducerById(id);

            expect(repo.getById).toHaveBeenCalledWith(id);
            expect(result).toBe(producer);
        });
    });

});
