import { INestApplication, ValidationPipe, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';

describe('CropsController (e2e)', () => {
    let app: INestApplication;
    let dataSource: DataSource;

    const server = () => request(app.getHttpServer());
    const basePath = '/crops';

    const createCrop = async (name: string) => {
        return server()
            .post(`${basePath}/`)
            .send({ name })
            .expect(HttpStatus.CREATED);
    };

    const expectBadRequestWithMessages = (body: any, expected: string | RegExp) => {
        expect(body.statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(body.error).toBe('Bad Request');
        const msgs = Array.isArray(body.message) ? body.message : [body.message];
        if (expected instanceof RegExp) {
            expect(msgs.some((m: any) => typeof m === 'string' && expected.test(m))).toBe(true);
        } else {
            expect(msgs).toContain(expected);
        }
    };

    const expectConflictWithMessage = (body: any, expected: string | RegExp) => {
        expect(body.statusCode).toBe(HttpStatus.CONFLICT);
        expect(body.error).toBe('Conflict');
        if (Array.isArray(body.message)) {
            const msgs: string[] = body.message;
            if (expected instanceof RegExp) {
                expect(msgs.some((m) => expected.test(m))).toBe(true);
            } else {
                expect(msgs).toContain(expected);
            }
        } else {
            if (expected instanceof RegExp) {
                expect(expected.test(body.message)).toBe(true);
            } else {
                expect(body.message).toBe(expected);
            }
        }
    };

    const expectBadRequestUuidMessage = (body: any) => {
        const msgs = Array.isArray(body.message) ? body.message : [body.message];
        expect(body.statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(body.error).toBe('Bad Request');
        expect(
            msgs.includes('Id must be a valid UUID (version 4), it should be provided in params'),
        ).toBe(true);
    };

    const expectEmptyNameError = (body: any) => {
        if (body.statusCode === HttpStatus.CONFLICT) {
            return expectConflictWithMessage(body, 'Crop name must not be empty');
        }
        if (body.statusCode === HttpStatus.BAD_REQUEST) {
            return expectBadRequestWithMessages(body, /name.*(should not be empty|must be a string)/i);
        }
        throw new Error(`Unexpected status for empty name: ${body.statusCode}`);
    };

    const expectDuplicateNameError = (body: any) => {
        expectConflictWithMessage(body, 'Crop with this name already exists');
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

    describe('POST /crops', () => {
        it('should create a crop and return its essential fields', async () => {
            const res = await createCrop('Soja');

            expect(res.body).toMatchObject({
                statusCode: HttpStatus.CREATED,
                message: 'Crop successfully created',
                data: {
                    crop: {
                        id: expect.any(String),
                        name: 'Soja',
                    },
                },
            });

            expect(Object.keys(res.body.data.crop)).toEqual(
                expect.arrayContaining(['id', 'name']),
            );
        });

        it('should reject empty name (409 or 400 depending on validation/business rule)', async () => {
            const res = await server()
                .post(`${basePath}/`)
                .send({ name: '' })
                .expect((r) =>
                    [HttpStatus.CONFLICT, HttpStatus.BAD_REQUEST].includes(r.status),
                );

            expectEmptyNameError(res.body);
        });

        it('should reject duplicate name with 409', async () => {
            await createCrop('Milho');

            const res = await server()
                .post(`${basePath}/`)
                .send({ name: 'Milho' })
                .expect(HttpStatus.CONFLICT);

            expectDuplicateNameError(res.body);
        });
    });

    describe('GET /crops (list)', () => {
        beforeAll(async () => {
            await dataSource.synchronize(true);
            await createCrop('Soja');
            await createCrop('Milho');
            await createCrop('Café');
        });

        it('should list crops (supports flexible shape)', async () => {
            const res = await server().get(`${basePath}/`).expect(HttpStatus.OK);

            expect(res.body).toMatchObject({
                statusCode: HttpStatus.OK,
                message: 'Crops successfully retrieved',
            });

            const cropsContainer = res.body?.data?.crops;

            expect(cropsContainer).toBeDefined();

            if (Array.isArray(cropsContainer)) {
                expect(cropsContainer.length).toBeGreaterThan(0);
                expect(cropsContainer[0]).toEqual(
                    expect.objectContaining({
                        id: expect.any(String),
                        name: expect.any(String),
                    }),
                );
            } else {
                expect(cropsContainer.items).toBeDefined();
                expect(Array.isArray(cropsContainer.items)).toBe(true);
                expect(cropsContainer.items.length).toBeGreaterThan(0);
                expect(cropsContainer.items[0]).toEqual(
                    expect.objectContaining({
                        id: expect.any(String),
                        name: expect.any(String),
                    }),
                );

                if ('total' in cropsContainer) {
                    expect(cropsContainer.total).toEqual(expect.any(Number));
                }
            }
        });

        it('should respect page/limit/order/orderBy when provided (if pagination is enabled)', async () => {
            const res = await server()
                .get(`${basePath}/?page=1&limit=2&order=ASC&orderBy=name`)
                .expect(HttpStatus.OK);

            const cropsContainer = res.body?.data?.crops;
            expect(cropsContainer).toBeDefined();

            if (Array.isArray(cropsContainer)) {
                expect(cropsContainer.length).toBeGreaterThan(0);
                expect(cropsContainer.length).toBeLessThanOrEqual(2);
            } else {
                expect(cropsContainer.items.length).toBeLessThanOrEqual(2);
                if ('page' in cropsContainer) expect(cropsContainer.page).toBe(1);
                if ('limit' in cropsContainer) expect(cropsContainer.limit).toBe(2);
                if ('order' in cropsContainer) expect(cropsContainer.order).toBe('ASC');
                if ('orderBy' in cropsContainer) expect(cropsContainer.orderBy).toBe('name');
            }
        });
    });

    describe('GET /crops/:id', () => {
        let cropId: string;

        beforeAll(async () => {
            await dataSource.synchronize(true);
            const res = await createCrop('Trigo');
            cropId = res.body.data.crop.id;
        });

        it('should retrieve a crop by id', async () => {
            const res = await server().get(`${basePath}/${cropId}`).expect(HttpStatus.OK);

            expect(res.body).toMatchObject({
                statusCode: HttpStatus.OK,
                message: 'Crop successfully retrieved',
                data: {
                    crop: expect.objectContaining({
                        id: cropId,
                        name: 'Trigo',
                    }),
                },
            });

            const crop = res.body.data.crop;
            if (crop.propertyCrops) {
                expect(Array.isArray(crop.propertyCrops)).toBe(true);
            }
        });

        it('should reject invalid UUID param', async () => {
            const res = await server().get(`${basePath}/123`).expect(HttpStatus.BAD_REQUEST);
            expectBadRequestUuidMessage(res.body);
        });

        it('should return 404 when crop not found', async () => {
            const res = await server()
                .get(`${basePath}/aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa`)
                .expect(HttpStatus.NOT_FOUND);

            expect(res.body).toMatchObject({
                statusCode: HttpStatus.NOT_FOUND,
                error: 'Not Found',
                message: 'Crop not found',
            });
        });
    });
});
