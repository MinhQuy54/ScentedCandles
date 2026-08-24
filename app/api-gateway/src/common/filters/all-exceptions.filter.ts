import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { appConfig } from '../config';

function getHttpErrorTitle(status: number): string {
  switch (status) {
    case HttpStatus.BAD_REQUEST:
      return 'Bad Request';
    case HttpStatus.UNAUTHORIZED:
      return 'Unauthorized';
    case HttpStatus.FORBIDDEN:
      return 'Forbidden';
    case HttpStatus.NOT_FOUND:
      return 'Not Found';
    case HttpStatus.CONFLICT:
      return 'Conflict';
    case HttpStatus.UNPROCESSABLE_ENTITY:
      return 'Unprocessable Entity';
    case HttpStatus.INTERNAL_SERVER_ERROR:
      return 'Internal Server Error';
    default:
      return 'Http Exception';
  }
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const statusCode = this.resolveStatus(exception);
    const { message, error } = this.resolveMessageAndError(exception, statusCode);

    if (!appConfig.isProduction) {
      this.logger.error(
        `[Exception] ${request?.method} ${request?.url} - ${statusCode} - ${JSON.stringify(message)}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response.status(statusCode).json({
      statusCode,
      message,
      error,
      path: request?.url,
      timestamp: new Date().toISOString(),
    });
  }

  private resolveStatus(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private resolveMessageAndError(
    exception: unknown,
    status: number,
  ): { message: string | string[]; error: string } {
    let errorTitle = getHttpErrorTitle(status);

    if (exception instanceof HttpException) {
      const payload = exception.getResponse();

      if (typeof payload === 'string') {
        return { message: payload, error: errorTitle };
      }

      if (payload && typeof payload === 'object') {
        const data = payload as Record<string, unknown>;
        if (typeof data.error === 'string' && data.error) {
          errorTitle = data.error;
        }

        if (Array.isArray(data.message)) {
          return { message: data.message as string[], error: errorTitle };
        }

        if (typeof data.message === 'string') {
          return { message: data.message, error: errorTitle };
        }
      }

      return { message: exception.message, error: errorTitle };
    }

    if (exception instanceof Error) {
      return {
        message: exception.message || 'Internal server error',
        error: 'Internal Server Error',
      };
    }

    return {
      message: 'Internal server error',
      error: 'Internal Server Error',
    };
  }
}
