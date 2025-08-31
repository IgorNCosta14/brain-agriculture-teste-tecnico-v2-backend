import { INestApplication, ValidationPipe, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';

describe('PropertyCropController (e2e)', () => {
    let app: INestApplication;
    let dataSource: DataSource;

    const server = () => request(app.getHttpServer());
    const basePath = '/property-crops';
    const producersPath = '/producers';
    const propertiesPath = '/properties';
    const cropsPath = '/crops';
    const harvestsPath = '/harvests';

    const validCpfA = '52998224725';
    const validCpfB = '15350946056';
    const validCpfC = '11144477735';

    const asArray = (msg: any) => (Array.isArray(msg) ? msg : [msg]);

    const expectBadRequestUuidParam = (body: any) => {
        const msgs = asArray(body.message);
        expect(body.statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(body.error).toBe('Bad Request');
        expect(
            msgs.includes('Id must be a valid UUID (version 4), it should be provided in params'),
        ).toBe(true);
    };

    const expectNotFoundMsg = (body: any, re: RegExp) => {
        expect(body.statusCode).toBe(HttpStatus.NOT_FOUND);
        expect(body.error).toBe('Not Found');
        expect(re.test(body.message)).toBe(true);
    };

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
        const res = await server().post(`${propertiesPath}/`).send(payload).expect(HttpStatus.CREATED);
        return res.body.data.property as { id: string;[k: string]: any };
    };

    const createCrop = async (name: string) => {
        const res = await server().post(`${cropsPath}/`).send({ name }).expect(HttpStatus.CREATED);
        return res.body.data.crop as { id: string; name: string };
    };

    const createHarvest = async (payload: {
        label: string;
        year: number;
        startDate: string;
        endDate: string;
    }) => {
        const res = await server().post(`${harvestsPath}/`).send(payload).expect(HttpStatus.CREATED);
        return res.body.data.harvest as { id: string;[k: string]: any };
    };

    const createPropertyCrop = async (payload: {
        propertyId: string;
        harvestId: string;
        cropId: string;
    }) => {
        const res = await server().post(`${basePath}/`).send(payload).expect(HttpStatus.CREATED);
        return res.body.data.propertyCrop as { id: string;[k: string]: any };
    };

    const expectPropertyCropShape = (pc: any) => {
        expect(pc.id).toEqual(expect.any(String));

        const hasIdRefs =
            typeof pc.propertyId === 'string' ||
            typeof pc.property_id === 'string' ||
            typeof pc.harvestId === 'string' ||
            typeof pc.harvest_id === 'string' ||
            typeof pc.cropId === 'string' ||
            typeof pc.crop_id === 'string';

        const hasNested =
            typeof pc.property === 'object' ||
            typeof pc.harvest === 'object' ||
            typeof pc.crop === 'object';

        expect(hasIdRefs || hasNested).toBe(true);
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

    describe('POST /property-crops', () => {
        it('should reject invalid UUIDs in body', async () => {
            await dataSource.synchronize(true);

            const res = await server()
                .post(`${basePath}/`)
                .send({
                    propertyId: '123',
                    harvestId: 'abc',
                    cropId: 'not-an-uuid',
                })
                .expect(HttpStatus.BAD_REQUEST);

            expect(res.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(res.body.error).toBe('Bad Request');
            expect(Array.isArray(res.body.message) || typeof res.body.message === 'string').toBe(true);
        });
    });

    describe('GET /property-crops (list)', () => {
        const seed = async () => {
            await dataSource.synchronize(true);

            const producer = await createProducer({ document: validCpfB, name: 'owner b' });
            const propertyA = await createProperty({
                producerId: producer.id,
                name: 'Alpha',
                city: 'Sorriso',
                state: 'MT',
                totalAreaHa: '100.00',
                arableAreaHa: '60.00',
                vegetationAreaHa: '40.00',
            });
            const propertyB = await createProperty({
                producerId: producer.id,
                name: 'Beta',
                city: 'Sinop',
                state: 'MT',
                totalAreaHa: '200.00',
                arableAreaHa: '150.00',
                vegetationAreaHa: '50.00',
            });

            const cropSoja = await createCrop('Soja');
            const cropMilho = await createCrop('Milho');

            const harvest2425 = await createHarvest({
                label: 'Safra 2024/2025',
                year: 2025,
                startDate: '2024-09-01',
                endDate: '2025-08-31',
            });
            const harvest2324 = await createHarvest({
                label: 'Safra 2023/2024',
                year: 2024,
                startDate: '2023-09-01',
                endDate: '2024-08-31',
            });

            const pc1 = await createPropertyCrop({
                propertyId: propertyA.id,
                harvestId: harvest2425.id,
                cropId: cropSoja.id,
            });
            const pc2 = await createPropertyCrop({
                propertyId: propertyA.id,
                harvestId: harvest2324.id,
                cropId: cropMilho.id,
            });
            const pc3 = await createPropertyCrop({
                propertyId: propertyB.id,
                harvestId: harvest2425.id,
                cropId: cropMilho.id,
            });

            return {
                propertyA,
                propertyB,
                cropSoja,
                cropMilho,
                harvest2425,
                harvest2324,
                pc1,
                pc2,
                pc3,
            };
        };
    });

    describe('GET /property-crops/:id', () => {
        it('should retrieve a property crop by id', async () => {
            await dataSource.synchronize(true);

            const producer = await createProducer({ document: validCpfC, name: 'owner c' });
            const property = await createProperty({
                producerId: producer.id,
                name: 'Delta',
                city: 'Sorriso',
                state: 'MT',
                totalAreaHa: '300.00',
                arableAreaHa: '200.00',
                vegetationAreaHa: '100.00',
            });
            const crop = await createCrop('Café');
            const harvest = await createHarvest({
                label: 'Safra 2026',
                year: 2026,
                startDate: '2026-01-01',
                endDate: '2026-12-31',
            });
            const pc = await createPropertyCrop({
                propertyId: property.id,
                harvestId: harvest.id,
                cropId: crop.id,
            });

            const res = await server().get(`${basePath}/${pc.id}`).expect(HttpStatus.OK);

            expect(res.body).toMatchObject({
                statusCode: HttpStatus.OK,
                message: 'Property crop successfully found',
                data: { propertyCrops: expect.any(Object) },
            });

            expectPropertyCropShape(res.body.data.propertyCrops);
        });

        it('should reject invalid UUID param', async () => {
            const res = await server().get(`${basePath}/123`).expect(HttpStatus.BAD_REQUEST);
            expectBadRequestUuidParam(res.body);
        });

        it('should return 404 when property crop not found', async () => {
            const res = await server()
                .get(`${basePath}/aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa`)
                .expect(HttpStatus.NOT_FOUND);

            expectNotFoundMsg(res.body, /property crop not found!?/i);
        });
    });

    describe('DELETE /property-crops/:id', () => {
        it('should soft delete a property crop', async () => {
            await dataSource.synchronize(true);

            const producer = await createProducer({ document: validCpfA, name: 'owner d' });
            const property = await createProperty({
                producerId: producer.id,
                name: 'Echo',
                city: 'Sorriso',
                state: 'MT',
                totalAreaHa: '400.00',
                arableAreaHa: '250.00',
                vegetationAreaHa: '150.00',
            });
            const crop = await createCrop('Trigo');
            const harvest = await createHarvest({
                label: 'Safra 2027',
                year: 2027,
                startDate: '2027-01-01',
                endDate: '2027-12-31',
            });
            const pc = await createPropertyCrop({
                propertyId: property.id,
                harvestId: harvest.id,
                cropId: crop.id,
            });

            const del = await server().delete(`${basePath}/${pc.id}`).expect(HttpStatus.OK);

            expect(del.body).toMatchObject({
                statusCode: HttpStatus.OK,
                message: 'Property crop successfully delete',
            });

            const get = await server()
                .get(`${basePath}/${pc.id}`)
                .expect(HttpStatus.NOT_FOUND);

            expectNotFoundMsg(get.body, /property crop not found!?/i);
        });

        it('should reject invalid UUID param on delete', async () => {
            const res = await server().delete(`${basePath}/123`).expect(HttpStatus.BAD_REQUEST);
            expectBadRequestUuidParam(res.body);
        });

        it('should return 404 when deleting non-existing property crop', async () => {
            const res = await server()
                .delete(`${basePath}/aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa`)
                .expect(HttpStatus.NOT_FOUND);

            expectNotFoundMsg(res.body, /property crop not found!?/i);
        });
    });
});
