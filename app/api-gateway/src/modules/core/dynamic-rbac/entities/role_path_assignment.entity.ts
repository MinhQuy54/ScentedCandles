import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PathSettingEntity } from './path_setting.entity';
import { RoleSettingEntity } from './role_setting.entity';

@Entity('TM_role_path_assignment')
export class RolePathAssignmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column()
  create: boolean;

  @Column()
  view: boolean;

  @Column()
  delete: boolean;

  @Column()
  update: boolean;

  @Column()
  import: boolean;

  @Column()
  export: boolean;

  @ManyToOne(
    () => PathSettingEntity,
    (pathSetting) => pathSetting.rolePathAssignments,
  )
  @JoinColumn({ name: 'path_id' })
  pathSetting: PathSettingEntity;

  @ManyToOne(
    () => RoleSettingEntity,
    (roleSetting) => roleSetting.rolePathAssignments,
  )
  @JoinColumn({ name: 'role_id' })
  roleSetting: RoleSettingEntity;

  @CreateDateColumn({ name: 'created_date', type: 'timestamptz' })
  createdDate?: Date;

  @UpdateDateColumn({ name: 'updated_date', type: 'timestamptz' })
  updatedDate?: Date;

  @Column({ name: 'is_deleted', default: false })
  isDeleted: boolean;

  @Column({ name: 'created_by', nullable: true })
  createdBy: string;

  @Column({ name: 'updated_by', nullable: true })
  updatedBy: string;
}
