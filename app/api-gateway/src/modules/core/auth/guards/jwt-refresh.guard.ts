import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Dùng: @UseGuards(JwtRefreshGuard) trên route POST /auth/refresh
@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {}
