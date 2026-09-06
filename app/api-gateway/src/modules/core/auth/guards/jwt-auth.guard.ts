import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      try {
        await (super.canActivate(context) as Promise<boolean>);
      } catch {
        // Khách vãng lai chưa có token hoặc token không hợp lệ -> Bỏ qua lỗi 401 cho các route @Public()
      }
      return true;
    }

    return super.canActivate(context) as Promise<boolean>;
  }
}
