import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: {email},
      relations: {roleSetting: true}
    })
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
    return this.userRepo.find();
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
