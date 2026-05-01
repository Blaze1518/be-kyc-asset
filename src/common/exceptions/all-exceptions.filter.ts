import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { getRequestId } from '../middleware/rtracer';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}
  catch(exception: any, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const requestId = getRequestId();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = isHttpException ? exception.getResponse() : null;

    const message =
      typeof exceptionResponse === 'object'
        ? (exceptionResponse as any).message || exception.message
        : exception.message || 'Internal Server Error';

    const displayMessage = Array.isArray(message)
      ? message.join(', ')
      : message;

    const logData = {
      requestId,
      method: httpAdapter.getRequestMethod(request),
      path: httpAdapter.getRequestUrl(request),
      status,
      message: displayMessage,
      timestamp: new Date().toISOString(),
    };

    if (status >= 500) {
      this.logger.error(
        `[RequestID: ${requestId}] ${logData.method} ${logData.path} | Status: ${status} | Error: ${message}`,
        exception.stack,
      );
    }

    const responseBody = {
      success: false,
      error: {
        statusCode: status,
        message:
          status >= 500 && process.env.NODE_ENV === 'production'
            ? 'Internal Server Error'
            : message,
        requestId,
        timestamp: new Date().toISOString(),
        path: httpAdapter.getRequestUrl(request),
      },
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, status);
  }
}
