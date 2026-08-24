import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

describe('JwtAuthGuard', () => {
  const reflector = new Reflector();
  const guard = new JwtAuthGuard(reflector);

  it('allows @Public routes without calling passport', () => {
    const context = {
      getHandler: () => ({}),
      getClass: () => ({}),
    } as ExecutionContext;

    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('delegates to passport when not public', () => {
    const context = {
      getHandler: () => ({}),
      getClass: () => ({}),
    } as ExecutionContext;

    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    const parentProto = Object.getPrototypeOf(JwtAuthGuard.prototype);
    const spy = jest.spyOn(parentProto, 'canActivate').mockReturnValue(true);
    expect(guard.canActivate(context)).toBe(true);
    spy.mockRestore();
  });
});
