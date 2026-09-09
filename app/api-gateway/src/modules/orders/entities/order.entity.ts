import { BaseEntity } from 'src/common/base/base-entity.base';
import { OrderStatus, PaymentMethod, PaymentStatus } from 'src/common/constants';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrderItem } from './order-item.entity';

@Entity('orders')
export class Order extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_number', unique: true, length: 50 })
  orderNumber: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({
    name: 'payment_status',
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @Column({
    name: 'payment_method',
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.COD,
  })
  paymentMethod: PaymentMethod;

  @Column({ name: 'shipping_recipient_name' })
  shippingRecipientName: string;

  @Column({ name: 'shipping_phone' })
  shippingPhone: string;

  @Column({ name: 'shipping_street_address' })
  shippingStreetAddress: string;

  @Column({ name: 'shipping_ward' })
  shippingWard: string;

  @Column({ name: 'shipping_district' })
  shippingDistrict: string;

  @Column({ name: 'shipping_city' })
  shippingCity: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  subtotal: string;

  @Column({
    name: 'shipping_fee',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  shippingFee: string;

  @Column({
    name: 'discount_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  discountAmount: string;

  @Column({ name: 'total_amount', type: 'decimal', precision: 12, scale: 2 })
  totalAmount: string;

  @Column({ type: 'text', nullable: true })
  note?: string;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items?: OrderItem[];
}
