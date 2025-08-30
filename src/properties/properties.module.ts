import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Property } from './property.entity';
import { PropertiesController } from './properties.controller';
import { PropertiesService } from './properties.service';
import { PropertyRepository } from './repositories/implementation/property.repository';
import { ProducersModule } from 'src/producers/producers.module';

@Module({
    imports: [TypeOrmModule.forFeature([Property]), ProducersModule],
    controllers: [PropertiesController],
    providers: [PropertiesService, PropertyRepository],
    exports: []
})

export class PropertiesModule { }
