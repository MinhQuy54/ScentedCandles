import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RoleSettingEntity } from '../core/dynamic-rbac/entities/role_setting.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResponseCommon } from 'src/common/dto/response.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(RoleSettingEntity)
    private readonly roleRepo: Repository<RoleSettingEntity>,
  ) { }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: { email },
      relations: { roleSetting: true },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: { id },
      relations: { roleSetting: true },
    });
  }

  async create(dto: CreateUserDto): Promise<User> {
    const user = this.userRepo.create({
      email: dto.email,
      passwordHash: dto.passwordHash,
      fullName: dto.fullName,
      phone: dto.phone,
      roleSettingId: dto.roleSettingId,
      isActive: true,
    });
    return this.userRepo.save(user);
  }

  async findAll() {
    const users = await this.userRepo.find({
      relations: { roleSetting: true },
      order: { created_at: 'DESC' },
    });
    return ResponseCommon.ok(
      users.map((u) => ({
        id: u.id,
        email: u.email,
        fullName: u.fullName,
        phone: u.phone,
        isActive: u.isActive,
        role: u.roleSetting?.code || 'CUSTOMER',
        created_at: u.created_at,
      })),
      'GET_USERS_SUCCESS',
    );
  }

  async updateStatus(id: string, isActive: boolean) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('USER_NOT_FOUND');

    user.isActive = isActive;
    await this.userRepo.save(user);
    return ResponseCommon.ok(user, 'UPDATE_USER_STATUS_SUCCESS');
  }

  async updateRole(id: string, roleCode: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('USER_NOT_FOUND');

    const role = await this.roleRepo.findOne({ where: { code: roleCode } });
    if (!role) throw new NotFoundException('ROLE_NOT_FOUND');

    user.roleSettingId = role.id;
    await this.userRepo.save(user);
    return ResponseCommon.ok(user, 'UPDATE_USER_ROLE_SUCCESS');
  }

  async removeUser(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('USER_NOT_FOUND');

    await this.userRepo.softDelete(id);
    return ResponseCommon.ok({ id }, 'DELETE_USER_SUCCESS');
  }

  findOne(id: number) {
    return this.userRepo.findOne({ where: { id: String(id) } });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return this.userRepo.update(String(id), updateUserDto as Partial<User>);
  }

  remove(id: number) {
    return this.userRepo.softDelete(String(id));
  }
}
