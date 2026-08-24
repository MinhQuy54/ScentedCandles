import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UsersService } from '../../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { IResponse } from 'src/common/interfaces/response.interface';
import * as bcrypt from 'bcrypt';
import { DynamicRbacService } from '../dynamic-rbac/dynamic-rbac.service';
import { User } from '../../users/entities/user.entity';

export interface RegisterResponseData {
  id: string;
  email: string;
  fullName: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly dynamicRbacService: DynamicRbacService,
    private readonly dataSource: DataSource,
  ) {}

  async register(dto: RegisterDto): Promise<IResponse<RegisterResponseData>> {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('PASSWORD_NO_MATCH');
    }

    const exists = await this.usersService.findByEmail(dto.email);
    if (exists) {
      throw new BadRequestException('EMAIL_ALREADY_EXISTS');
    }

    const customerRole = await this.dynamicRbacService.findRoleSettingByCode(
      'CUSTOMER',
    );
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
}
