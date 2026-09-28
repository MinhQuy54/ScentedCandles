import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

const SENSITIVE_KEYS = new Set([
  'password',
  'oldpassword',
  'confirmpassword',
  'token',
  'accesstoken',
  'refreshtoken',
  'secret',
  'creditcard',
  'cvv',
]);

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly name = 'HTTP-Log';
  private readonly logger = new Logger(this.name);

  private sanitize(data: unknown): unknown {
    if (data === null || data === undefined) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.sanitize(item));
    }

    if (typeof data === 'object') {
      const sanitized: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
        if (SENSITIVE_KEYS.has(key.toLowerCase())) {
          sanitized[key] = '[REDACTED]';
        } else {
          sanitized[key] = this.sanitize(value);
        }
      }
      return sanitized;
    }

    return data;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();

    const method = request.method;
    const url = request.originalUrl || request.url;
    const userAgent = request.get ? request.get('user-agent') || 'Unknown' : (request.headers?.['user-agent'] as string) || 'Unknown';
    const safeBody = this.sanitize(request.body);

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          this.logger.log(
            `[${method}] ${url} - ${duration}ms | Agent: ${userAgent} | Body: ${JSON.stringify(safeBody)}`,
          );
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          this.logger.warn(
            `[${method}] ${url} - Failed in ${duration}ms | Error: ${error.message} | Body: ${JSON.stringify(safeBody)}`,
          );
        },
      }),
    );
  }
}

