import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../products/entities/product.entity';
import { RoleGuard } from '../core/auth/guards/role.guard';
import { StorageModule } from '../storage/storage.module';
import { AdminProductImagesController } from './admin-product-images.controller';
import { ProductImage } from './entities/product-image.entity';
import { ProductImagesService } from './product-images.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductImage, Product]),
    StorageModule,
  ],
  controllers: [AdminProductImagesController],
  providers: [ProductImagesService, RoleGuard],
  exports: [ProductImagesService],
})
export class ProductImagesModule {}
