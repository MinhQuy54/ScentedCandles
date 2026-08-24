import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConfig } from 'src/common/config';
import { UsersService } from 'src/modules/users/users.service';

export interface JwtPayload {
  sub: string; // user id
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.secret || '',
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.userService.findById(payload.sub);
    if (!user) throw new UnauthorizedException('USER_NOT_FOUND');
    return {
      userId: user.id,
      email: user.email,
      roleSetting: user.roleSetting,
    };
  }
}
