import { AllExceptionsFilter } from './all-exceptions.filter';
import { ArgumentsHost, BadRequestException, ForbiddenException, HttpStatus, NotFoundException } from '@nestjs/common';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let mockResponse: any;
  let mockRequest: any;
  let mockArgumentsHost: ArgumentsHost;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockRequest = {
      url: '/api/test',
      method: 'GET',
    };
    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as unknown as ArgumentsHost;
  });

  it('should format single string HttpException correctly', () => {
    const exception = new NotFoundException('Project 123 not found');
    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
        message: 'Project 123 not found',
        error: 'Not Found',
        path: '/api/test',
      }),
    );
  });

  it('should format array message ValidationPipe BadRequestException correctly', () => {
    const exception = new BadRequestException({
      statusCode: 400,
      message: ['summary must be a string', 'summary should not be empty'],
      error: 'Bad Request',
    });
    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: ['summary must be a string', 'summary should not be empty'],
        error: 'Bad Request',
        path: '/api/test',
      }),
    );
  });

  it('should format ForbiddenException correctly', () => {
    const exception = new ForbiddenException('Bạn không có quyền truy cập');
    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 403,
        message: 'Bạn không có quyền truy cập',
        error: 'Forbidden',
        path: '/api/test',
      }),
    );
  });

  it('should handle non-HttpException as 500 Internal Server Error', () => {
    const exception = new Error('Database connection failed');
    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        message: 'Database connection failed',
        error: 'Internal Server Error',
        path: '/api/test',
      }),
    );
  });
});
