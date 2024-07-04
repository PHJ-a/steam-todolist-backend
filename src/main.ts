import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import * as cookieParser from 'cookie-parser';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const backendRootUrl = `http://${process.env.NEST_API_BASE_URL}:${process.env.NEST_API_PORT}`;
  const frontendRootUrl = `http://${process.env.FRONT_END_BASE_URL}:${process.env.FRONT_END_PORT}`;
  const PORT = process.env.NEST_API_PORT || 3000;

  app.use(cookieParser());
  app.use(express.static(join(__dirname, '..', 'public')));
  app.enableCors({
    origin: [backendRootUrl, frontendRootUrl],
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  await app.listen(PORT, () => {
    console.log(`Server started in port ${PORT}`);
  });
}
bootstrap();
