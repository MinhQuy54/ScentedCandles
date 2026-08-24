import { Module } from '@nestjs/common';
import { DynamicRbacService } from './dynamic-rbac.service';
import { DynamicRbacController } from './dynamic-rbac.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PathSettingEntity } from './entities/path_setting.entity';
import { RoleSettingEntity } from './entities/role_setting.entity';
import { RolePathAssignmentEntity } from './entities/role_path_assignment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    PathSettingEntity, 
    RoleSettingEntity, 
    RolePathAssignmentEntity,
  ])],
  controllers: [DynamicRbacController],
  providers: [DynamicRbacService],
  exports: [DynamicRbacService],
})
export class DynamicRbacModule {}
