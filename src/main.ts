import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import * as cookieParser from 'cookie-parser';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // configService
  const configService = app.get(ConfigService);
  const backendPort = configService.get<number>('NEST_API_PORT', 3000);
  const frontendPort = configService.get<number>('FRONT_END_PORT');
  const frontHost = configService.get<string>('FRONT_END_BASE_URL');
  const backendHost = configService.get<string>('NEST_API_BASE_URL');
  // baseUrl
  const backendRootUrl = `http://${backendHost}:${backendPort}`;
  const frontendRootUrl = `http://${frontHost}:${frontendPort}`;

  app.use(cookieParser());
  app.use(express.static(join(__dirname, '..', 'public')));
  app.enableCors({
    origin: [backendRootUrl, frontendRootUrl],
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  await app.listen(backendPort, () => {
    console.log(`Server started in port ${backendPort}`);
  });
}
bootstrap();
