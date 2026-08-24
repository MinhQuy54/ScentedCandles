import { RoleSettingEntity } from 'src/modules/core/dynamic-rbac/entities/role_setting.entity';
import { BaseEntity } from 'src/common/base/base-entity.base';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('users')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'role_setting_id', nullable: true })
  roleSettingId?: string;

  @ManyToOne(() => RoleSettingEntity, (roleSetting) => roleSetting.users)
  @JoinColumn({ name: 'role_setting_id' })
  roleSetting?: RoleSettingEntity;
}
