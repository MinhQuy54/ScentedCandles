import { InventoryTransactionType } from 'src/common/constants';
import { Inventory } from './inventory.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('inventory_transactions')
export class InventoryTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'inventory_id' })
  inventoryId: string;

  @ManyToOne(() => Inventory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inventory_id' })
  inventory?: Inventory;

  @Column({
    type: 'enum',
    enum: InventoryTransactionType,
  })
  type: InventoryTransactionType;

  @Column({ name: 'quantity_change' })
  quantityChange: number;

  @Column({ name: 'quantity_after' })
  quantityAfter: number;

  @Column({ name: 'reference_type', nullable: true })
  referenceType?: string;

  @Column({ name: 'reference_id', nullable: true })
  referenceId?: string;

  @Column({ nullable: true })
  note?: string;

  @Column({ name: 'created_by', nullable: true })
  createdBy?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
