import { INestApplication, ValidationPipe, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';

describe('ProducersController (e2e) - POST /producers', () => {
    let app: INestApplication;
    let dataSource: DataSource;

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

    it('should create a producer (201) and return only id and name', async () => {
        const payload = { document: '566.912.940-76', name: 'Acme Farming Co.' };

        const { status, body } = await request(app.getHttpServer())
            .post('/producers')
            .send(payload);

        expect(status).toBe(HttpStatus.CREATED);
        expect(body).toEqual({
            statusCode: HttpStatus.CREATED,
            message: 'Producer successfully created',
            data: {
                id: expect.any(String),
                name: 'Acme Farming Co.',
            },
        });

        expect(Object.keys(body.data)).toEqual(['id', 'name']);
    });

    it('should accept document with punctuation (transform) and create (201)', async () => {
        const payload = { document: '46.837.206/0001-71', name: 'With Punctuation' };

        const { status, body } = await request(app.getHttpServer())
            .post('/producers')
            .send(payload);

        expect(status).toBe(HttpStatus.CREATED);
        expect(body.statusCode).toBe(HttpStatus.CREATED);
        expect(body.data).toEqual({
            id: expect.any(String),
            name: 'With Punctuation',
        });
    });

    it('should return 400 when name already exists', async () => {
        await request(app.getHttpServer())
            .post('/producers')
            .send({ document: '81.579.698/0001-43', name: 'Duplicated Name' })
            .expect(HttpStatus.CREATED);

        const { status, body } = await request(app.getHttpServer())
            .post('/producers')
            .send({ document: '47.539.942/0001-06', name: 'Duplicated Name' });

        expect(status).toBe(HttpStatus.BAD_REQUEST);
        expect(body).toMatchObject({
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Producer name already exists',
            error: 'Bad Request',
        });
    });

    it('should return 400 when document already exists', async () => {
        await request(app.getHttpServer())
            .post('/producers')
            .send({ document: '58.239.922/0001-36', name: 'First By Doc' })
            .expect(HttpStatus.CREATED);

        const { status, body } = await request(app.getHttpServer())
            .post('/producers')
            .send({ document: '58.239.922/0001-36', name: 'Second By Doc' });

        expect(status).toBe(HttpStatus.BAD_REQUEST);
        expect(body).toMatchObject({
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Producer document already exists',
            error: 'Bad Request',
        });
    });

    it('should return 400 when document is algorithmically invalid (Invalid document)', async () => {
        const invalidDoc = '00000000000';
        const { status, body } = await request(app.getHttpServer())
            .post('/producers')
            .send({ document: invalidDoc, name: 'Invalid Doc' });

        expect(status).toBe(HttpStatus.BAD_REQUEST);
        expect(body).toMatchObject({
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Invalid document. Must be a valid CPF or CNPJ.',
            error: 'Bad Request',
        });
    });

    it('should return 400 with DTO validation errors', async () => {
        const payload = { document: 'abcd', name: '' };

        const { status, body } = await request(app.getHttpServer())
            .post('/producers')
            .send(payload);

        expect(status).toBe(HttpStatus.BAD_REQUEST);
        expect(body.statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(Array.isArray(body.message)).toBe(true);
        expect(body.message).toEqual(
            expect.arrayContaining([
                'document must contain only numbers',
                'name should not be empty',
            ]),
        );
        expect(body.error).toBe('Bad Request');
    });

    it('should return 400 when document length is out of range (min 11, max 14)', async () => {
        const tooShort = { document: '123', name: 'Too Short' };
        let res = await request(app.getHttpServer())
            .post('/producers')
            .send(tooShort);

        expect(res.status).toBe(HttpStatus.BAD_REQUEST);
        expect(res.body.message).toEqual(
            expect.arrayContaining(['document must be between 11 and 14 digits']),
        );

        const tooLong = { document: '123456789012345', name: 'Too Long' };
        res = await request(app.getHttpServer()).post('/producers').send(tooLong);

        expect(res.status).toBe(HttpStatus.BAD_REQUEST);
        expect(res.body.message).toEqual(
            expect.arrayContaining(['document must be between 11 and 14 digits']),
        );
    });

    it('should return 400 when name exceeds 150 chars', async () => {
        const longName = 'x'.repeat(151);
        const { status, body } = await request(app.getHttpServer())
            .post('/producers')
            .send({ document: '12345678901', name: longName });

        expect(status).toBe(HttpStatus.BAD_REQUEST);
        expect(body.message).toEqual(
            expect.arrayContaining(['name must not exceed 150 characters']),
        );
    });
});