import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Property } from './property.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Property])],
    controllers: [],
    providers: [],
    exports: []
})

export class PropertiesModule { }
