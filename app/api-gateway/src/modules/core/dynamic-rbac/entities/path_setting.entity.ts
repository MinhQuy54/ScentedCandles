import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RolePathAssignmentEntity } from './role_path_assignment.entity';

@Entity('TM_path_setting')
export class PathSettingEntity {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ unique: true })
  code: string;

  @Column()
  route: string;

  @Column()
  description: string;

  @Column()
  status: string;

  @OneToMany(
    () => RolePathAssignmentEntity,
    (rolePathAssignment) => rolePathAssignment.pathSetting,
  )
  rolePathAssignments: RolePathAssignmentEntity[];

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
