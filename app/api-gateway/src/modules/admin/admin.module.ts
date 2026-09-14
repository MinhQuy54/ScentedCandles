import { Module } from '@nestjs/common';
import { ProductsModule } from '../products/products.module';
import { ProductImagesModule } from '../product-images/product-images.module';
import { CategoryModule } from '../category/category.module';
import { UsersModule } from '../users/users.module';
import { RoleGuard } from '../core/auth/guards/role.guard';
import { AdminProductsController } from './admin-products.controller';
import { AdminProductImagesController } from './admin-product-images.controller';
import { AdminCategoriesController } from './admin-categories.controller';
import { AdminUsersController } from './admin-users.controller';

@Module({
  imports: [ProductsModule, ProductImagesModule, CategoryModule, UsersModule],
  controllers: [
    AdminProductsController,
    AdminProductImagesController,
    AdminCategoriesController,
    AdminUsersController,
  ],
  providers: [RoleGuard],
})
export class AdminModule {}
