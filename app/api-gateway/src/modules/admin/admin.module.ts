import { Module } from '@nestjs/common';
import { ProductsModule } from '../products/products.module';
import { ProductImagesModule } from '../product-images/product-images.module';
import { RoleGuard } from '../core/auth/guards/role.guard';
import { AdminProductsController } from './admin-products.controller';
import { AdminProductImagesController } from './admin-product-images.controller';

@Module({
  imports: [ProductsModule, ProductImagesModule],
  controllers: [AdminProductsController, AdminProductImagesController],
  providers: [RoleGuard],
})
export class AdminModule {}
