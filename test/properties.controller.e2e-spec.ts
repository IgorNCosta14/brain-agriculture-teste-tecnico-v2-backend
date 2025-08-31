import { INestApplication, ValidationPipe, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';

describe('PropertiesController (e2e)', () => {
    let app: INestApplication;
    let dataSource: DataSource;

    const server = () => request(app.getHttpServer());
    const basePath = '/properties';
    const producersPath = '/producers';

    const validCpfA = '52998224725';
    const validCpfB = '15350946056';

    const createProducer = async (payload: { document: string; name: string }) => {
        const res = await server().post(`${producersPath}/`).send(payload).expect(HttpStatus.CREATED);
        return res.body.data.producer as { id: string; name: string };
    };

    type CreatePropertyPayload = {
        producerId: string;
        name: string;
        city: string;
        state: string;
        totalAreaHa: string;
        arableAreaHa: string;
        vegetationAreaHa: string;
        cep?: string;
        complement?: string;
        latitude?: string;
        longitude?: string;
    };

    const createProperty = async (payload: CreatePropertyPayload) => {
        return server().post(`${basePath}/`).send(payload).expect(HttpStatus.CREATED);
    };

    const expectBadRequestWith = (body: any, expected: string | RegExp) => {
        expect(body.statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(body.error).toBe('Bad Request');
        const msgs = Array.isArray(body.message) ? body.message : [body.message];
        if (expected instanceof RegExp) {
            expect(msgs.some((m: any) => typeof m === 'string' && expected.test(m))).toBe(true);
        } else {
            expect(msgs).toContain(expected);
        }
    };

    const expectBadRequestUuidParam = (body: any) => {
        const msgs = Array.isArray(body.message) ? body.message : [body.message];
        expect(body.statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(body.error).toBe('Bad Request');
        expect(
            msgs.includes('Id must be a valid UUID (version 4), it should be provided in params'),
        ).toBe(true);
    };

    const expectNotFound = (body: any, message: string | RegExp) => {
        expect(body.statusCode).toBe(HttpStatus.NOT_FOUND);
        expect(body.error).toBe('Not Found');
        if (message instanceof RegExp) {
            expect(message.test(body.message)).toBe(true);
        } else {
            expect(body.message).toBe(message);
        }
    };

    const expectAreaExceeded = (body: any) => {
        expectBadRequestWith(
            body,
            /(Arable.*cannot exceed.*total area|sum of arable area and vegetation area cannot exceed the total area)/i,
        );
    };

    const isStringOrNumber = (v: any) =>
        typeof v === 'string' || typeof v === 'number';

    const expectPropertyShape = (p: any) => {
        expect(p.id).toEqual(expect.any(String));
        expect(p.name).toEqual(expect.any(String));

        const total =
            p.totalAreaHa ?? p.total_area_ha ?? p.total_area ?? p.total;
        const arable =
            p.arableAreaHa ?? p.arable_area_ha ?? p.arable_area;
        const veg =
            p.vegetationAreaHa ?? p.vegetation_area_ha ?? p.vegetation_area;

        expect(isStringOrNumber(total)).toBe(true);
        expect(isStringOrNumber(arable)).toBe(true);
        expect(isStringOrNumber(veg)).toBe(true);

        if (p.city !== undefined) expect(p.city).toEqual(expect.any(String));
        if (p.state !== undefined) expect(p.state).toEqual(expect.any(String));
        if (p.producerId !== undefined) expect(typeof p.producerId).toBe('string');
        if (p.producer_id !== undefined) expect(typeof p.producer_id).toBe('string');
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

    describe('POST /properties', () => {
        let producer: { id: string; name: string };

        beforeAll(async () => {
            await dataSource.synchronize(true);
            producer = await createProducer({ document: validCpfA, name: 'owner a' });
        });

        it('should reject when arable + vegetation exceeds total', async () => {
            const res = await server()
                .post(`${basePath}/`)
                .send({
                    producerId: producer.id,
                    name: 'Fazenda X',
                    city: 'Sorriso',
                    state: 'MT',
                    totalAreaHa: '100.00',
                    arableAreaHa: '60.01',
                    vegetationAreaHa: '40.00',
                })
                .expect(HttpStatus.BAD_REQUEST);

            expectAreaExceeded(res.body);
        });

        it('should reject validation errors (uuid, numbers, lat/long)', async () => {
            const res = await server()
                .post(`${basePath}/`)
                .send({
                    producerId: '123',
                    name: '',
                    city: 'City',
                    state: 'ST',
                    totalAreaHa: '10.123',
                    arableAreaHa: '5.00',
                    vegetationAreaHa: '5.00',
                    cep: '123',
                    latitude: '12.1234567',
                    longitude: 'xx.y',
                })
                .expect(HttpStatus.BAD_REQUEST);

            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.error).toBe('Bad Request');
            expect(Array.isArray(res.body.message) || typeof res.body.message === 'string').toBe(true);
        });
    });

    describe('GET /properties/:id', () => {
        let producer: { id: string; name: string };
        let propertyId: string;

        beforeAll(async () => {
            await dataSource.synchronize(true);
            producer = await createProducer({ document: validCpfA, name: 'owner c' });
            const res = await createProperty({
                producerId: producer.id,
                name: 'Delta',
                city: 'Sorriso',
                state: 'MT',
                totalAreaHa: '400.00',
                arableAreaHa: '250.00',
                vegetationAreaHa: '150.00',
            });
            propertyId = res.body.data.property.id;
        });

        it('should retrieve a property by id', async () => {
            const res = await server().get(`${basePath}/${propertyId}`).expect(HttpStatus.OK);

            expect(res.body).toMatchObject({
                statusCode: HttpStatus.OK,
                message: 'Property successfully found',
                data: { property: expect.any(Object) },
            });

            expectPropertyShape(res.body.data.property);
        });

        it('should reject invalid UUID param', async () => {
            const res = await server().get(`${basePath}/123`).expect(HttpStatus.BAD_REQUEST);
            expectBadRequestUuidParam(res.body);
        });

        it('should return 404 when property not found', async () => {
            const res = await server()
                .get(`${basePath}/aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa`)
                .expect(HttpStatus.NOT_FOUND);

            expectNotFound(res.body, /Property not found!?/);
        });
    });

    describe('PUT /properties/:id', () => {
        let producer: { id: string; name: string };
        let propertyId: string;

        beforeAll(async () => {
            await dataSource.synchronize(true);
            producer = await createProducer({ document: validCpfB, name: 'owner d' });
            const res = await createProperty({
                producerId: producer.id,
                name: 'Echo',
                city: 'Sorriso',
                state: 'MT',
                totalAreaHa: '500.00',
                arableAreaHa: '300.00',
                vegetationAreaHa: '200.00',
            });
            propertyId = res.body.data.property.id;
        });

        it('should update property fields (name/areas/location)', async () => {
            const res = await server()
                .put(`${basePath}/${propertyId}`)
                .send({
                    name: 'Echo (Atualizada)',
                    totalAreaHa: '600.00',
                    arableAreaHa: '350.00',
                    vegetationAreaHa: '250.00',
                    cep: '78555000',
                    latitude: '-12.500000',
                    longitude: '-55.700000',
                })
                .expect(HttpStatus.OK);

            expect(res.body).toMatchObject({
                statusCode: HttpStatus.OK,
                message: 'Property successfully updated',
                data: { property: expect.any(Object) },
            });

            const prop = res.body.data.property;
            expectPropertyShape(prop);
            expect(prop.name).toBe('Echo (Atualizada)');
        });

        it('should reject when areas sum exceeds total on update', async () => {
            const res = await server()
                .put(`${basePath}/${propertyId}`)
                .send({
                    totalAreaHa: '100.00',
                    arableAreaHa: '60.01',
                    vegetationAreaHa: '40.00',
                })
                .expect(HttpStatus.BAD_REQUEST);

            expectAreaExceeded(res.body);
        });

        it('should reject validation errors on update body', async () => {
            const res = await server()
                .put(`${basePath}/${propertyId}`)
                .send({
                    totalAreaHa: '10.123',
                    latitude: '10.1234567',
                })
                .expect(HttpStatus.BAD_REQUEST);

            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.error).toBe('Bad Request');
        });

        it('should reject invalid UUID param on update', async () => {
            const res = await server().put(`${basePath}/123`).send({ name: 'noop' }).expect(HttpStatus.BAD_REQUEST);
            expectBadRequestUuidParam(res.body);
        });

        it('should return 404 when updating non-existing property', async () => {
            const res = await server()
                .put(`${basePath}/aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa`)
                .send({ name: 'ghost' })
                .expect(HttpStatus.NOT_FOUND);

            expectNotFound(res.body, /Property not found!?/);
        });
    });

    describe('DELETE /properties/:id', () => {
        let producer: { id: string; name: string };
        let propertyId: string;

        beforeAll(async () => {
            await dataSource.synchronize(true);
            producer = await createProducer({ document: validCpfA, name: 'owner e' });
            const res = await createProperty({
                producerId: producer.id,
                name: 'Foxtrot',
                city: 'Sorriso',
                state: 'MT',
                totalAreaHa: '700.00',
                arableAreaHa: '400.00',
                vegetationAreaHa: '300.00',
            });
            propertyId = res.body.data.property.id;
        });

        it('should soft delete a property', async () => {
            const del = await server().delete(`${basePath}/${propertyId}`).expect(HttpStatus.OK);

            expect(del.body).toMatchObject({
                statusCode: HttpStatus.OK,
                message: 'Property successfully deleted',
            });

            const get = await server().get(`${basePath}/${propertyId}`).expect(HttpStatus.NOT_FOUND);
            expectNotFound(get.body, /Property not found!?/);
        });

        it('should reject invalid UUID param on delete', async () => {
            const res = await server().delete(`${basePath}/123`).expect(HttpStatus.BAD_REQUEST);
            expectBadRequestUuidParam(res.body);
        });

        it('should return 404 when deleting non-existing property', async () => {
            const res = await server()
                .delete(`${basePath}/aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa`)
                .expect(HttpStatus.NOT_FOUND);

            expectNotFound(res.body, /Property not found!?/);
        });
    });
});
