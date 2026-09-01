import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { DataSource, IsNull, MoreThan, Repository } from 'typeorm';
import { UsersService } from '../../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { IResponse } from 'src/common/interfaces/response.interface';
import * as bcrypt from 'bcrypt';
import { DynamicRbacService } from '../dynamic-rbac/dynamic-rbac.service';
import { User } from '../../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './strategies/jwt.strategy';
import { JwtService } from '@nestjs/jwt';
import { appConfig, jwtConfig } from 'src/common/config';
import { RefreshDto } from './dto/refresh.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { createHash, randomBytes } from 'crypto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

export interface RegisterResponseData {
  id: string;
  email: string;
  fullName: string;
}

export interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role?: string;
  };
}

export interface MeResponseData {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role?: string;
  isActive: boolean;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(PasswordResetToken)
    private readonly resetTokenRepo: Repository<PasswordResetToken>,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly dynamicRbacService: DynamicRbacService,
    private readonly dataSource: DataSource,
  ) {}

  private hashToken(raw: string): string {
    return createHash('sha256').update(raw).digest('hex');
  }

  async register(dto: RegisterDto): Promise<IResponse<RegisterResponseData>> {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('PASSWORD_NO_MATCH');
    }

    const exists = await this.usersService.findByEmail(dto.email);
    if (exists) {
      throw new BadRequestException('EMAIL_ALREADY_EXISTS');
    }

    const customerRole =
      await this.dynamicRbacService.findRoleSettingByCode('CUSTOMER');
    if (!customerRole?.id) {
      throw new BadRequestException('ROLE_NOT_CONFIGURED');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.dataSource.transaction(async (manager) => {
      const userRepo = manager.getRepository(User);
      const entity = userRepo.create({
        email: dto.email,
        passwordHash,
        fullName: dto.fullName,
        phone: dto.phone,
        roleSettingId: customerRole.id,
        isActive: true,
      });
      return userRepo.save(entity);
    });

    return {
      code: 201,
      success: true,
      message: 'USER_REGISTERED_SUCCESSFULLY',
      data: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
    };
  }

  async login(dto: LoginDto): Promise<IResponse<LoginResponseData>> {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('INVALID_CREDENTIALS');
    }

    const passwordOk = await bcrypt.compare(dto.password, user.passwordHash);

    if (!passwordOk) {
      throw new UnauthorizedException('INVALID_CREDENTIALS');
    }

    const roleCode = user.roleSetting?.code;
    const roles = roleCode ? [roleCode] : [];

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: roles,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: jwtConfig.refreshSecret,
      expiresIn: jwtConfig.accessTokenExpiresRefreshInLogin as any,
    });

    return {
      code: 200,
      success: true,
      message: 'LOGIN_SUCCESS',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: roleCode,
        },
      },
    };
  }

  async getMe(userId: string): Promise<IResponse<MeResponseData>> {
    const user = await this.usersService.findById(userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('USER_NOT_FOUND');
    }

    return {
      code: 200,
      success: true,
      message: 'PROFILE_FETCHED',
      data: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.roleSetting?.code,
        isActive: user.isActive,
      },
    };
  }

  async refresh(dto: RefreshDto): Promise<IResponse<{ accessToken: string }>> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(dto.refreshToken, {
        secret: jwtConfig.refreshSecret,
      });

      const user = await this.usersService.findById(payload.sub);
      if (!user || !user.isActive) {
        throw new UnauthorizedException('INVALID_REFRESH_TOKEN');
      }

      const roleCode = user.roleSetting?.code;
      const newPayload: JwtPayload = {
        sub: user.id,
        email: user.email,
        role: roleCode ? [roleCode] : [],
      };

      const accessToken = this.jwtService.sign(newPayload);
      return {
        code: 200,
        success: true,
        message: 'ACCESS_TOKEN_REFRESHED',
        data: { accessToken },
      };
    } catch (error) {
      throw new UnauthorizedException('INVALID_REFRESH_TOKEN');
    }
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<IResponse<null>> {
    const user = await this.usersService.findByEmail(dto.email);

    if (user?.isActive) {
      const rawToken = randomBytes(32).toString('hex');
      const tokenHash = this.hashToken(rawToken);
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

      await this.resetTokenRepo.save({
        userId: user.id,
        tokenHash,
        expiresAt,
      });

      const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173';
      const resetUrl = `${frontendUrl}/reset-password?token=${rawToken}`;

      if (!appConfig.isProduction) {
        console.log('[ForgotPassword] Reset link:', resetUrl);
      }
    }

    return {
      code: 200,
      success: true,
      message: 'RESET_EMAIL_SENT_IF_EXISTS',
      data: null,
    };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<IResponse<null>> {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('PASSWORD_NO_MATCH');
    }

    const tokenHash = this.hashToken(dto.token);
    const now = new Date();

    const row = await this.resetTokenRepo.findOne({
      where: {
        tokenHash,
        usedAt: IsNull(),
        expiresAt: MoreThan(now),
      },
    });

    if (!row) {
      throw new BadRequestException('INVALID_OR_EXPIRED_TOKEN');
    }

    const user = await this.usersService.findById(row.userId);
    if (!user || !user.isActive) {
      throw new BadRequestException('INVALID_OR_EXPIRED_TOKEN');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(User).update(user.id, { passwordHash });
      await manager.getRepository(PasswordResetToken).update(row.id, {
        usedAt: now,
      });
    });

    return {
      code: 200,
      success: true,
      message: 'PASSWORD_RESET_SUCCESS',
      data: null,
    };
  }
}
