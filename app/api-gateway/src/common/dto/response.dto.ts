import { ApiProperty } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';
import { IResponse } from '../interfaces/response.interface';

export class ResponseCommon<T = null> implements IResponse<T> {
  @ApiProperty()
  readonly success: boolean;

  @ApiProperty()
  readonly message: string;

  @ApiProperty()
  readonly code: number;

  readonly data: T;

  constructor(success: boolean, message: string, code: number, data: T) {
    this.success = success;
    this.message = message;
    this.code = code;
    this.data = data;
  }

  static ok<T>(data: T, message = 'OK'): ResponseCommon<T> {
    return new ResponseCommon(true, message, HttpStatus.OK, data);
  }

  static created<T>(data: T, message = 'Created'): ResponseCommon<T> {
    return new ResponseCommon(true, message, HttpStatus.CREATED, data);
  }

  static fail(code: number, message: string): ResponseCommon<null> {
    return new ResponseCommon(false, message, code, null);
  }
}
