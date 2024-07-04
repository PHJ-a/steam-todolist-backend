import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import * as cookieParser from 'cookie-parser';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.use(express.static(join(__dirname, '..', 'public')));
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  })
  await app.listen(process.env.NEST_API_PORT, () => {
    console.log(`Server started in port ${process.env.NEST_API_PORT}`)
  });
}
bootstrap();
