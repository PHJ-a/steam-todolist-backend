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
  // baseUrl
  const backendRootUrl = configService.get<string>('BACK_END_URL');
  const frontendRootUrl = configService.get<string>('FRONT_END_URL');
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

  await app.listen(3000, () => {
    console.log(`Server started.`);
  });
}
bootstrap();
