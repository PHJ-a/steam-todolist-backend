import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import * as cookieParser from 'cookie-parser';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // configService
  const configService = app.get(ConfigService);
  const backendPort = configService.get<number>('NEST_API_PORT', 3000);
  const backendHost = configService.get<string>('NEST_API_BASE_URL');
  const frontendPort = configService.get<number>('FRONT_END_PORT', 443);
  const frontHost = configService.get<string>(
    'FRONT_END_BASE_URL',
    'localhost',
  );
  // baseUrl
  const backendRootUrl = `https://${backendHost}`;
  const frontendRootUrl = `https://${frontHost}`;
  const config = new DocumentBuilder()
    .setTitle('Steam Todo APi Doc')
    .setDescription('Steam Todo 백엔드 api 문서')
    .addCookieAuth('jwt')
    .addTag('Steam Todo Api')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  app.use(cookieParser());
  app.use(express.static(join(__dirname, '..', 'public')));
  app.enableCors({
    origin: [frontendRootUrl, backendRootUrl],
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  SwaggerModule.setup('api', app, document);

  await app.listen(backendPort, () => {
    console.log(`Server started in port ${backendPort}`);
  });
}
bootstrap();
