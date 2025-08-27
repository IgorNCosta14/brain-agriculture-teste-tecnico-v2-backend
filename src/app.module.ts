import { Module } from '@nestjs/common';
import { ProducersModule } from './producers/producers.module';

@Module({
  imports: [ProducersModule]
})
export class AppModule { }
