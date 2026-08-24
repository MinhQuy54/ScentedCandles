import { Injectable } from '@nestjs/common';
import { CreateDynamicRbacDto } from './dto/create-dynamic-rbac.dto';
import { UpdateDynamicRbacDto } from './dto/update-dynamic-rbac.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PathSettingEntity } from './entities/path_setting.entity';
import { Repository } from 'typeorm';
import { RoleSettingEntity } from './entities/role_setting.entity';
import { RolePathAssignmentEntity } from './entities/role_path_assignment.entity';
import { PermissionAction } from './types/permission-action.type';

@Injectable()
export class DynamicRbacService {
  constructor(
    @InjectRepository(PathSettingEntity)
    private pathSettingRepository: Repository<PathSettingEntity>,
    @InjectRepository(RoleSettingEntity)
    private roleSettingRepository: Repository<RoleSettingEntity>,
    @InjectRepository(RolePathAssignmentEntity)
    private rolePathAssignmentRepository: Repository<RolePathAssignmentEntity>,
  ) {}

  create(createDynamicRbacDto: CreateDynamicRbacDto) {
    return createDynamicRbacDto;
  }

  findAll() {
    return [];
  }

  findOne(id: number) {
    return { id };
  }

  update(id: number, updateDynamicRbacDto: UpdateDynamicRbacDto) {
    return { id, ...updateDynamicRbacDto };
  }

  remove(id: number) {
    return { id };
  }

  async findRoleSettingByCode(code: string): Promise<RoleSettingEntity | null> {
    return await this.roleSettingRepository.findOne({
      where: {
        code,
        isDeleted: false,
      },
    });
  }

  async can(
    roleSettingId: string,
    pathCode: string,
    action: PermissionAction,
  ): Promise<boolean> {
    const assignment = await this.rolePathAssignmentRepository.findOne({
      where: {
        roleSetting: { id: roleSettingId },
        pathSetting: { code: pathCode },
        isDeleted: false,
      },
      relations: { pathSetting: true, roleSetting: true },
    });

    if (!assignment) {
      return false;
    }

    switch (action) {
      case 'create':
        return assignment.create;
      case 'view':
        return assignment.view;
      case 'update':
        return assignment.update;
      case 'delete':
        return assignment.delete;
      case 'import':
        return assignment.import;
      case 'export':
        return assignment.export;
      default:
        return false;
    }
  }
}
