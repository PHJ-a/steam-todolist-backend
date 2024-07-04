import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import * as cookieParser from 'cookie-parser';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.use(express.static(join(__dirname, '..', 'public')));
  const backendRootUrl = `http://${process.env.NEST_API_BASE_URL}:${process.env.NEST_API_PORT}`;
  const frontendRootUrl = `http://${process.env.FRONT_END_BASE_URL}:${process.env.FRONT_END_PORT}`;
  app.enableCors({
    origin: [backendRootUrl, frontendRootUrl],
    credentials: true,
  })
  const PORT = process.env.NEST_API_PORT || 3000;
  await app.listen(PORT, () => {
    console.log(`Server started in port ${PORT}`)
  });
}
bootstrap();
