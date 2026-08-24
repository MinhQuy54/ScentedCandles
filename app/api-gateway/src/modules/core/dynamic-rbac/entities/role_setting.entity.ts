import { User } from 'src/modules/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RolePathAssignmentEntity } from './role_path_assignment.entity';

@Entity('TM_role_setting')
export class RoleSettingEntity {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ unique: true })
  code: string;

  @Column()
  description: string;

  @Column()
  status: string;

  @OneToMany(
    () => RolePathAssignmentEntity,
    (rolePathAssignment) => rolePathAssignment.roleSetting,
  )
  rolePathAssignments: RolePathAssignmentEntity[];

  @OneToMany(() => User, (user) => user.roleSetting)
  users: User[];

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
