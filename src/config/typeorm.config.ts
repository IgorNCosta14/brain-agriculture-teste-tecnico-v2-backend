import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Producer } from '../producers/producer.entity';
import { Crop } from 'src/crops/crop.entity';
import { Harvest } from 'src/harvests/harvest.entity';
import { Property } from 'src/properties/property.entity';
import { PropertyCrop } from 'src/property-crops/property-crop.entity';

export const ConfigTypeOrm = (): TypeOrmModuleOptions => {
    const isTestEnvironment = process.env.NODE_ENV === 'test';

    return {
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: +(process.env.DB_PORT || 5432),
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASS || 'postgres',
        database: isTestEnvironment ? process.env.DB_NAME_TESTS : (process.env.DB_NAME || 'farmhub'),
        entities: [Producer, Crop, Harvest, Property, PropertyCrop],
        synchronize: true,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    };
};