import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { RoleSettingEntity } from '../core/dynamic-rbac/entities/role_setting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, RoleSettingEntity])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
