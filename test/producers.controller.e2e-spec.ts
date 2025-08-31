import { INestApplication, ValidationPipe, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';

describe('ProducersController (e2e)', () => {
    let app: INestApplication;
    let dataSource: DataSource;

    const server = () => request(app.getHttpServer());
    const basePath = '/producers';

    const validCpf = '52998224725';
    const anotherValidCpf = '12345678909';
    const validCnpj = '12345678000195';

    const listCpf1 = '52998224725';
    const listCpf2 = '15350946056';
    const listCpf3 = '11144477735';

    const invalidDoc = '000';

    const createProducer = async (payload: { document: string; name: string }) => {
        return server()
            .post(`${basePath}/`)
            .send(payload)
            .expect(HttpStatus.CREATED);
    };

    const expectBadRequestWithMessage = (body: any, expected: string | RegExp) => {
        expect(body.statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(body.error).toBe('Bad Request');

        const msgs = Array.isArray(body.message) ? body.message : [body.message];
        if (expected instanceof RegExp) {
            expect(msgs.some((m: any) => typeof m === 'string' && expected.test(m))).toBe(true);
        } else {
            expect(msgs).toContain(expected);
        }
    };

    const expectBadRequestUuidMessage = (body: any) => {
        expectBadRequestWithMessage(
            body,
            'Id must be a valid UUID (version 4), it should be provided in params',
        );
    };

    const expectBadRequestInvalidDocumentMessage = (body: any) => {
        const msgs = Array.isArray(body.message) ? body.message : [body.message];
        const hasBusiness = msgs.includes('Invalid document');
        const hasDto =
            msgs.find((m: any) => typeof m === 'string' && /between 11 and 14 digits/i.test(m)) !=
            null;
        expect(body.statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(body.error).toBe('Bad Request');
        expect(hasBusiness || hasDto).toBe(true);
    };

    beforeAll(async () => {
        const moduleRef: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleRef.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

        await app.init();

        dataSource = app.get(DataSource);
        await dataSource.synchronize(true);
    });

    afterAll(async () => {
        await app.close();
    });

    describe('POST /producers', () => {
        it('should create a producer (CPF) and return only essential fields', async () => {
            const res = await createProducer({
                document: validCpf,
                name: 'john doe',
            });

            expect(res.body).toMatchObject({
                statusCode: HttpStatus.CREATED,
                message: 'Producer successfully created',
                data: {
                    producer: {
                        id: expect.any(String),
                        name: 'john doe',
                    },
                },
            });

            expect(Object.keys(res.body.data.producer)).toEqual(
                expect.arrayContaining(['id', 'name']),
            );
        });

        it('should reject duplicated name', async () => {
            await createProducer({ document: anotherValidCpf, name: 'acme' });

            const res = await server()
                .post(`${basePath}/`)
                .send({ document: validCnpj, name: 'acme' })
                .expect(HttpStatus.BAD_REQUEST);

            expect(res.body).toMatchObject({
                statusCode: HttpStatus.BAD_REQUEST,
                error: 'Bad Request',
                message: 'Producer name already exists',
            });
        });

        it('should reject duplicated document', async () => {
            await createProducer({ document: validCnpj, name: 'unique name' });

            const res = await server()
                .post(`${basePath}/`)
                .send({ document: validCnpj, name: 'another name' })
                .expect(HttpStatus.BAD_REQUEST);

            expect(res.body).toMatchObject({
                statusCode: HttpStatus.BAD_REQUEST,
                error: 'Bad Request',
                message: 'Producer document already exists',
            });
        });

        it('should reject invalid document (CPF/CNPJ)', async () => {
            const res = await server()
                .post(`${basePath}/`)
                .send({ document: invalidDoc, name: 'invalid doc' })
                .expect(HttpStatus.BAD_REQUEST);

            expectBadRequestInvalidDocumentMessage(res.body);
        });

        it('should validate body types and required fields', async () => {
            const res = await server()
                .post(`${basePath}/`)
                .send({ document: 123, name: '' })
                .expect(HttpStatus.BAD_REQUEST);

            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.error).toBe('Bad Request');
            expect(Array.isArray(res.body.message)).toBe(true);
            expect(res.body.message.length).toBeGreaterThan(0);
        });
    });

    describe('GET /producers (list)', () => {
        beforeAll(async () => {
            await dataSource.synchronize(true);
            await createProducer({ document: listCpf1, name: 'igor 1' });
            await createProducer({ document: listCpf2, name: 'igor 2' });
            await createProducer({ document: listCpf3, name: 'igor 3' });
        });

        it('should list paginated producers with defaults', async () => {
            const res = await server().get(`${basePath}/`).expect(HttpStatus.OK);

            expect(res.body).toMatchObject({
                statusCode: HttpStatus.OK,
                message: 'Producers successfully retrieved',
                data: {
                    producers: {
                        items: expect.any(Array),
                        total: expect.any(Number),
                        totalPages: expect.any(Number),
                        page: expect.any(Number),
                        limit: expect.any(Number),
                        order: expect.any(String),
                        orderBy: expect.any(String),
                    },
                },
            });

            const { items } = res.body.data.producers;
            expect(items.length).toBeGreaterThan(0);
            expect(items[0]).toEqual(
                expect.objectContaining({
                    id: expect.any(String),
                    documentType: expect.any(String),
                    document: expect.any(String),
                    name: expect.any(String),
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                    deletedAt: null,
                }),
            );
        });

        it('should respect page/limit/order/orderBy params', async () => {
            const res = await server()
                .get(`${basePath}/?page=1&limit=2&order=ASC&orderBy=createdAt`)
                .expect(HttpStatus.OK);

            const { producers } = res.body.data;
            expect(producers.items.length).toBe(2);
            expect(producers.page).toBe(1);
            expect(producers.limit).toBe(2);
            expect(producers.order).toBe('ASC');
            expect(producers.orderBy).toBe('createdAt');
        });
    });

    describe('GET /producers/:id', () => {
        let existingId: string;

        beforeAll(async () => {
            await dataSource.synchronize(true);
            const res = await createProducer({ document: validCpf, name: 'target' });
            existingId = res.body.data.producer.id;
        });

        it('should find a producer by id', async () => {
            const res = await server().get(`${basePath}/${existingId}`).expect(HttpStatus.OK);

            expect(res.body).toMatchObject({
                statusCode: HttpStatus.OK,
                message: 'Producer successfully found',
                data: {
                    producer: expect.objectContaining({
                        id: existingId,
                        name: 'target',
                    }),
                },
            });

            expect(res.body.data.producer).toEqual(
                expect.objectContaining({
                    document: expect.any(String),
                    documentType: expect.any(String),
                }),
            );
        });

        it('should reject invalid UUID param', async () => {
            const res = await server().get(`${basePath}/123`).expect(HttpStatus.BAD_REQUEST);

            expectBadRequestUuidMessage(res.body);
        });

        it('should return 404 when producer not found', async () => {
            const res = await server()
                .get(`${basePath}/aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa`)
                .expect(HttpStatus.NOT_FOUND);

            expect(res.body).toMatchObject({
                statusCode: HttpStatus.NOT_FOUND,
                error: 'Not Found',
                message: 'Producer not found!',
            });
        });
    });

    describe('PUT /producers/:id', () => {
        let idA: string;
        let idB: string;

        beforeAll(async () => {
            await dataSource.synchronize(true);
            const a = await createProducer({ document: validCpf, name: 'alpha' });
            const b = await createProducer({ document: validCnpj, name: 'beta' });
            idA = a.body.data.producer.id;
            idB = b.body.data.producer.id;
        });

        it('should update name and/or document', async () => {
            const res = await server()
                .put(`${basePath}/${idA}`)
                .send({ name: 'alpha updated', document: anotherValidCpf })
                .expect(HttpStatus.OK);

            expect(res.body).toMatchObject({
                statusCode: HttpStatus.OK,
                message: 'Producer successfully updated',
                data: {
                    producer: expect.objectContaining({
                        id: idA,
                        name: 'alpha updated',
                        document: anotherValidCpf,
                        documentType: 'CPF',
                    }),
                },
            });
        });

        it('should reject invalid document on update', async () => {
            const res = await server()
                .put(`${basePath}/${idA}`)
                .send({ document: invalidDoc })
                .expect(HttpStatus.BAD_REQUEST);

            expectBadRequestInvalidDocumentMessage(res.body);
        });

        it('should reject duplicated document on update', async () => {
            const res = await server()
                .put(`${basePath}/${idA}`)
                .send({ document: validCnpj })
                .expect(HttpStatus.BAD_REQUEST);

            expect(res.body).toMatchObject({
                statusCode: HttpStatus.BAD_REQUEST,
                error: 'Bad Request',
                message: 'Producer document already exists',
            });
        });

        it('should reject duplicated name on update', async () => {
            const res = await server()
                .put(`${basePath}/${idA}`)
                .send({ name: 'beta' })
                .expect(HttpStatus.BAD_REQUEST);

            expect(res.body).toMatchObject({
                statusCode: HttpStatus.BAD_REQUEST,
                error: 'Bad Request',
                message: 'Producer name already exists',
            });
        });

        it('should reject invalid UUID on update', async () => {
            const res = await server()
                .put(`${basePath}/123`)
                .send({ name: 'noop' })
                .expect(HttpStatus.BAD_REQUEST);

            expectBadRequestUuidMessage(res.body);
        });

        it('should return 404 when updating non-existing producer', async () => {
            const res = await server()
                .put(`${basePath}/aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa`)
                .send({ name: 'ghost' })
                .expect(HttpStatus.NOT_FOUND);

            expect(res.body).toMatchObject({
                statusCode: HttpStatus.NOT_FOUND,
                error: 'Not Found',
                message: 'Producer not found!',
            });
        });
    });

    describe('DELETE /producers/:id', () => {
        let targetId: string;

        beforeAll(async () => {
            await dataSource.synchronize(true);
            const res = await createProducer({ document: validCpf, name: 'to delete' });
            targetId = res.body.data.producer.id;
        });

        it('should soft delete a producer', async () => {
            const del = await server().delete(`${basePath}/${targetId}`).expect(HttpStatus.OK);

            expect(del.body).toMatchObject({
                statusCode: HttpStatus.OK,
                message: 'Producer successfully deleted',
            });

            const get = await server().get(`${basePath}/${targetId}`).expect(HttpStatus.NOT_FOUND);

            expect(get.body).toMatchObject({
                statusCode: HttpStatus.NOT_FOUND,
                error: 'Not Found',
                message: 'Producer not found!',
            });
        });

        it('should reject invalid UUID on delete', async () => {
            const res = await server().delete(`${basePath}/123`).expect(HttpStatus.BAD_REQUEST);
            expectBadRequestUuidMessage(res.body);
        });

        it('should return 404 when deleting non-existing producer', async () => {
            const res = await server()
                .delete(`${basePath}/aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa`)
                .expect(HttpStatus.NOT_FOUND);

            expect(res.body).toMatchObject({
                statusCode: HttpStatus.NOT_FOUND,
                error: 'Not Found',
                message: 'Producer not found!',
            });
        });
    });
});
