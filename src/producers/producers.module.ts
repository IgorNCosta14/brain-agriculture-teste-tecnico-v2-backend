import { Module } from '@nestjs/common';
import { ProducersController } from './producers.controller';
import { ProducersService } from './producers.service';
import { ProducerRepository } from './repositories/implementation/producer.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Producer } from './producer.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Producer])],
    controllers: [ProducersController],
    providers: [ProducersService, ProducerRepository],
    exports: [ProducersService]
})

export class ProducersModule { }
