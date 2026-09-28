import { LoggingInterceptor } from './logging.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of, throwError } from 'rxjs';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: CallHandler;
  let mockRequest: any;

  beforeEach(() => {
    interceptor = new LoggingInterceptor();
    mockRequest = {
      method: 'POST',
      url: '/auth/login',
      originalUrl: '/auth/login',
      get: jest.fn().mockReturnValue('TestAgent'),
      body: {
        username: 'user1',
        password: 'superSecretPassword',
        nested: {
          token: 'abc123secret',
        },
      },
    };

    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;

    mockCallHandler = {
      handle: jest.fn().mockReturnValue(of({ success: true })),
    };
  });

  it('should sanitize sensitive keys recursively and handle success stream', (done) => {
    const spyLog = jest.spyOn((interceptor as any).logger, 'log').mockImplementation();

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: (val) => {
        expect(val).toEqual({ success: true });
        expect(spyLog).toHaveBeenCalled();
        const logMsg = spyLog.mock.calls[0][0];
        expect(logMsg).toContain('[POST] /auth/login');
        expect(logMsg).toContain('"password":"[REDACTED]"');
        expect(logMsg).toContain('"token":"[REDACTED]"');
        expect(logMsg).toContain('"username":"user1"');
        done();
      },
    });
  });

  it('should handle error stream gracefully', (done) => {
    const spyWarn = jest.spyOn((interceptor as any).logger, 'warn').mockImplementation();
    mockCallHandler.handle = jest.fn().mockReturnValue(throwError(() => new Error('Request failed')));

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      error: (err) => {
        expect(err.message).toBe('Request failed');
        expect(spyWarn).toHaveBeenCalled();
        const warnMsg = spyWarn.mock.calls[0][0];
        expect(warnMsg).toContain('Failed in');
        expect(warnMsg).toContain('Request failed');
        done();
      },
    });
  });
});
