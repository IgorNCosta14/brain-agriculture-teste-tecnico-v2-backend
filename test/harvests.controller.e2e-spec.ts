import { INestApplication, ValidationPipe, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';

describe('HarvestsController (e2e)', () => {
    let app: INestApplication;
    let dataSource: DataSource;

    const server = () => request(app.getHttpServer());
    const basePath = '/harvests';

    type CreateHarvestPayload = {
        label: string;
        year: number;
        startDate: string;
        endDate: string;
    };

    const createHarvest = async (payload: CreateHarvestPayload) => {
        return server()
            .post(`${basePath}/`)
            .send(payload)
            .expect(HttpStatus.CREATED);
    };

    const expectBadRequestWith = (body: any, expected: string | RegExp) => {
        expect(body.statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(body.error).toBe('Bad Request');
        const msgs = Array.isArray(body.message) ? body.message : [body.message];

        if (expected instanceof RegExp) {
            expect(
                msgs.some((m: unknown) => typeof m === 'string' && expected.test(m)),
            ).toBe(true);
        } else {
            expect(msgs).toContain(expected);
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

    const expectEndBeforeStartError = (body: any) => {
        const msgs = Array.isArray(body.message) ? body.message : [body.message];
        const hasBusiness = msgs.includes('End date must be on or after start date');
        const hasDto = msgs.some(
            (m: any) =>
                typeof m === 'string' &&
                (/endDate/i.test(m) || /startDate/i.test(m)) &&
                (/must be.*valid date/i.test(m) || /should not be empty/i.test(m)),
        );
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

    describe('POST /harvests', () => {
        it('should create a harvest with ISO dates and return essential fields', async () => {
            const res = await createHarvest({
                label: 'Safra 2025',
                year: 2025,
                startDate: '2025-01-01',
                endDate: '2025-12-31',
            });

            expect(res.body).toMatchObject({
                statusCode: HttpStatus.CREATED,
                message: 'Harvest successfully created',
                data: {
                    harvest: {
                        id: expect.any(String),
                        label: 'Safra 2025',
                        year: 2025,
                        startDate: expect.any(String),
                        endDate: expect.any(String),
                    },
                },
            });
        });

        it('should accept brazilian date format (DD/MM/YYYY) and normalize', async () => {
            const res = await createHarvest({
                label: 'Safra 2024',
                year: 2024,
                startDate: '01/01/2024',
                endDate: '31/12/2024',
            });

            expect(res.body.statusCode).toBe(HttpStatus.CREATED);
            expect(res.body.message).toBe('Harvest successfully created');
            const { harvest } = res.body.data;
            expect(harvest).toEqual(
                expect.objectContaining({
                    id: expect.any(String),
                    label: 'Safra 2024',
                    year: 2024,
                    startDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
                    endDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
                }),
            );
        });

        it('should reject when endDate is before startDate', async () => {
            const res = await server()
                .post(`${basePath}/`)
                .send({
                    label: 'Inválida',
                    year: 2025,
                    startDate: '2025-06-01',
                    endDate: '2025-05-31',
                })
                .expect(HttpStatus.BAD_REQUEST);

            expectEndBeforeStartError(res.body);
        });

        it('should reject invalid date format', async () => {
            const res = await server()
                .post(`${basePath}/`)
                .send({
                    label: 'Formato inválido',
                    year: 2025,
                    startDate: '2025-13-01',
                    endDate: '2025-12-31',
                })
                .expect(HttpStatus.BAD_REQUEST);

            expectBadRequestWith(res.body, /(startDate).*(valid date|invalid)/i);
        });

        it('should validate body types and required fields', async () => {
            const res = await server()
                .post(`${basePath}/`)
                .send({
                    year: '2025',
                    startDate: '',
                    endDate: '',
                })
                .expect(HttpStatus.BAD_REQUEST);

            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.error).toBe('Bad Request');
            expect(Array.isArray(res.body.message)).toBe(true);
            expect(res.body.message.length).toBeGreaterThan(0);
        });
    });

    describe('GET /harvests (list)', () => {
        beforeAll(async () => {
            await dataSource.synchronize(true);
            await createHarvest({
                label: 'Safra 2023/2024',
                year: 2024,
                startDate: '2023-09-01',
                endDate: '2024-08-31',
            });
            await createHarvest({
                label: 'Safra 2024/2025',
                year: 2025,
                startDate: '2024-09-01',
                endDate: '2025-08-31',
            });
            await createHarvest({
                label: '2ª Safra 2025',
                year: 2025,
                startDate: '2025-01-01',
                endDate: '2025-06-30',
            });
        });

        it('should list harvests and include meta if provided', async () => {
            const res = await server().get(`${basePath}/`).expect(HttpStatus.OK);

            expect(res.body).toMatchObject({
                statusCode: HttpStatus.OK,
                message: 'Harvests successfully retrieved',
            });

            const { data, meta } = res.body;

            expect(data).toBeDefined();
            expect(data.harvests).toBeDefined();

            expect(Array.isArray(data.harvests)).toBe(true);
            expect(data.harvests.length).toBeGreaterThan(0);
            expect(data.harvests[0]).toEqual(
                expect.objectContaining({
                    id: expect.any(String),
                    label: expect.any(String),
                    year: expect.any(Number),
                    startDate: expect.any(String),
                    endDate: expect.any(String),
                }),
            );

            if (meta) {
                expect(meta).toEqual(
                    expect.objectContaining({
                        page: expect.any(Number),
                        limit: expect.any(Number),
                        total: expect.any(Number),
                        totalPages: expect.any(Number),
                        order: expect.any(String),
                        orderBy: expect.any(String),
                    }),
                );
            }
        });

        it('should respect page/limit/order/orderBy params', async () => {
            const res = await server()
                .get(`${basePath}/?page=1&limit=2&order=DESC&orderBy=year`)
                .expect(HttpStatus.OK);

            const { data, meta } = res.body;

            expect(Array.isArray(data.harvests)).toBe(true);
            expect(data.harvests.length).toBeLessThanOrEqual(2);

            if (meta) {
                expect(meta.page).toBe(1);
                expect(meta.limit).toBe(2);
                expect(meta.order).toBe('DESC');
                expect(meta.orderBy).toBe('year');
            }
        });
    });

    describe('GET /harvests/:id', () => {
        let harvestId: string;

        beforeAll(async () => {
            await dataSource.synchronize(true);
            const res = await createHarvest({
                label: 'Consulta 2026',
                year: 2026,
                startDate: '2026-01-15',
                endDate: '2026-12-20',
            });
            harvestId = res.body.data.harvest.id;
        });

        it('should retrieve a harvest by id', async () => {
            const res = await server()
                .get(`${basePath}/${harvestId}`)
                .expect(HttpStatus.OK);

            expect(res.body).toMatchObject({
                statusCode: HttpStatus.OK,
                message: 'Harvest successfully retrieved',
                data: {
                    harvest: expect.objectContaining({
                        id: harvestId,
                        label: 'Consulta 2026',
                        year: 2026,
                    }),
                },
            });

            const { harvest } = res.body.data;
            if (harvest.propertyCrops) {
                expect(Array.isArray(harvest.propertyCrops)).toBe(true);
            }
        });

        it('should reject invalid UUID param', async () => {
            const res = await server().get(`${basePath}/123`).expect(HttpStatus.BAD_REQUEST);
            expectBadRequestUuidMessage(res.body);
        });

        it('should return 404 when harvest not found', async () => {
            const res = await server()
                .get(`${basePath}/aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa`)
                .expect(HttpStatus.NOT_FOUND);

            expect(res.body).toMatchObject({
                statusCode: HttpStatus.NOT_FOUND,
                error: 'Not Found',
                message: 'Harvest not found',
            });
        });
    });
});
