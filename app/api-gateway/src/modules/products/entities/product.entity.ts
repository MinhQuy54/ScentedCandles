import { BaseEntity } from 'src/common/base/base-entity.base';
import { ProductStatus } from 'src/common/constants';
import { Category } from 'src/modules/category/entities/category.entity';
import { ProductImage } from 'src/modules/product-images/entities/product-image.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('products')
export class Product extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'category_id' })
  categoryId: string;

  @ManyToOne(() => Category, (c) => c.products)
  @JoinColumn({ name: 'category_id' })
  category?: Category;

  @Column({ length: 50, unique: true })
  sku: string;

  @Column({ length: 255 })
  name: string;

  @Column({ unique: true, length: 255 })
  slug: string;

  @Column({ name: 'short_description', length: 500, nullable: true })
  shortDescription?: string;

  @Column({ name: 'raw_description', type: 'text' })
  rawDescription: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: string; // TypeORM decimal → string

  @Column({
    name: 'compare_at_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  compareAtPrice?: string;

  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.DRAFT,
  })
  status: ProductStatus;

  @Column({ name: 'is_featured', default: false })
  isFeatured: boolean;

  @Column({ name: 'weight_grams', nullable: true })
  weightGrams?: number;

  @Column({
    name: 'burn_time_hours',
    type: 'decimal',
    precision: 5,
    scale: 1,
    nullable: true,
  })
  burnTimeHours?: string;

  @OneToMany(() => ProductImage, (img) => img.product)
  images?: ProductImage[];
}
