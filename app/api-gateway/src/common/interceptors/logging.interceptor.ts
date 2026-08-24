import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import logSymbols from 'log-symbols';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly name = 'HTTP-Log';
  private logger = new Logger(this.name);

  private sanitizeBody(url: string, body: unknown): unknown {
    if (!body || typeof body !== 'object') {
      return body;
    }
    const isAuthRoute =
      url.includes('/auth/login') || url.includes('/auth/register');
    if (!isAuthRoute) {
      return body;
    }
    const record = { ...(body as Record<string, unknown>) };
    if ('password' in record) {
      record.password = '[REDACTED]';
    }
    return record;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const userAgent =
      typeof request.headers.get === 'function'
        ? request.headers.get('user-agent')
        : (request.headers as unknown as Record<string, string | undefined>)['user-agent'];
    const safeBody = this.sanitizeBody(request.url, request.body);
    let log = `
            *********************************************************************************
            *      API Request  | [${request.method} -${request.url}] | REQ-${now}
            *                   | [Agent] ${userAgent}`;
    return next.handle().pipe(
      tap(
        () => {
          log += `
            *                   | [Data] ${JSON.stringify(safeBody)}
            *      API Response | ${logSymbols.success} in ${Date.now() - now
            } ms 
            *********************************************************************************
                `;
          this.logger.log(log);
        },
        () => {
          log += `
            *                   | [Data] ${JSON.stringify(safeBody)}
            *      API Response | ${logSymbols.error} in ${Date.now() - now} ms 
            *********************************************************************************
                `;
          this.logger.log(log);
        },
      ),
    );
  }
}
