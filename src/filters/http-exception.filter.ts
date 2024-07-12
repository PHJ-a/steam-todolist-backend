import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ExceptionFilterRes } from 'src/dtos/res-exception.dto';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionRes: ExceptionFilterRes = {
      statusCode: status,
      message: exception.message,
      timestamp: new Date(),
      path: request.url,
    };

    response.status(status).json(exceptionRes);
  }
}
