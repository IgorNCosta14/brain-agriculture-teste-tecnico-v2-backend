import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as yaml from 'js-yaml';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    transform: true
  }));

  const config = new DocumentBuilder()
    .setTitle('Farmhub API')
    .setDescription('Documentação da Farmhub Nest API')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api-docs', app, document);

  app.getHttpAdapter().getInstance().get('/api-docs-json', (req, res) => {
    res.json(document);
  });

  app.getHttpAdapter().getInstance().get('/api-docs-yaml', (req, res) => {
    res.type('text/yaml');
    res.send(yaml.dump(document));
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
