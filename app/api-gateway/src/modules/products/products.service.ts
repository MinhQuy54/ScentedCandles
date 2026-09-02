import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  FindOptionsWhere,
  ILike,
  IsNull,
  Repository,
} from 'typeorm';
import { plainToClass } from 'class-transformer';
import { ProductStatus } from 'src/common/constants';
import { ResponseCommon } from 'src/common/dto/response.dto';
import { Product } from './entities/product.entity';
import { QueryProductsDto } from './dto/query-products.dto';
import { OutProductListDto } from './dto/out-product-list.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Category } from '../category/entities/category.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(
    query: QueryProductsDto,
  ): Promise<ResponseCommon<OutProductListDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: FindOptionsWhere<Product> = {
      status: ProductStatus.ACTIVE,
    };

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.name) {
      where.name = ILike(`%${query.name}%`);
    }

    if (query.categoryName) {
      where.category = { name: ILike(`%${query.categoryName}%`) };
    }

    const [products, total] = await this.productRepo.findAndCount({
      where,
      relations: { category: true, images: true },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return ResponseCommon.ok(
      { data: products, total, page, limit },
      'GET_LIST_PRODUCT_SUCCESS',
    );
  }

  async findOne(id: string): Promise<ResponseCommon<Product>> {
    const product = await this.productRepo.findOne({
      where: { id, status: ProductStatus.ACTIVE },
      relations: { category: true, images: true },
    });

    if (!product) {
      throw new NotFoundException('PRODUCT_NOT_FOUND');
    }

    return ResponseCommon.ok(product, 'GET_PRODUCT_SUCCESS');
  }

  async findOneAdmin(id: string): Promise<ResponseCommon<Product>> {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: { category: true, images: true },
      withDeleted: true,
    });

    if (!product) {
      throw new NotFoundException('PRODUCT_NOT_FOUND');
    }

    return ResponseCommon.ok(product, 'GET_PRODUCT_SUCCESS');
  }

  async findAllAdmin(
    query: QueryProductsDto,
  ): Promise<ResponseCommon<OutProductListDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: FindOptionsWhere<Product> = {};

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.name) {
      where.name = ILike(`%${query.name}%`);
    }

    if (query.categoryName) {
      where.category = { name: ILike(`%${query.categoryName}%`) };
    }

    const [products, total] = await this.productRepo.findAndCount({
      where,
      relations: { category: true, images: true },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      withDeleted: true,
    });

    return ResponseCommon.ok(
      { data: products, total, page, limit },
      'GET_LIST_PRODUCT_SUCCESS',
    );
  }

  async createProduct(dto: CreateProductDto): Promise<ResponseCommon<Product>> {
    const category = await this.dataSource.getRepository(Category).findOneBy({
      id: dto.categoryId,
      deleted_at: IsNull(),
    });

    if (!category) {
      throw new BadRequestException('CATEGORY_NOT_FOUND');
    }

    const object = plainToClass(Product, dto);
    object.shortDescription = dto.shortDescription ?? '';
    object.rawDescription = dto.rawDescription ?? '';
    object.category = category;
    object.categoryId = category.id;
    object.price = String(dto.price);
    object.status = dto.status ?? ProductStatus.DRAFT;
    object.isFeatured = dto.isFeatured ?? false;
    object.sku = dto.sku?.trim() ? dto.sku.trim() : await this.initializeSku();
    object.slug = await this.ensureUniqueSlug(
      this.slugify(dto.slug?.trim() || dto.name),
    );

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      await queryRunner.startTransaction();

      const product = await queryRunner.manager.save(object);
      if (!product) {
        throw new BadRequestException('CREATE_FAILED');
      }

      await queryRunner.commitTransaction();
      return ResponseCommon.created(product, 'CREATE_PRODUCT_SUCCESS');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateProduct(
    id: string,
    dto: UpdateProductDto,
  ): Promise<ResponseCommon<Product>> {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException('PRODUCT_NOT_FOUND');
    }

    if (dto.categoryId) {
      const category = await this.dataSource.getRepository(Category).findOneBy({
        id: dto.categoryId,
        deleted_at: IsNull(),
      });
      if (!category) {
        throw new BadRequestException('CATEGORY_NOT_FOUND');
      }
      product.categoryId = category.id;
    }

    if (dto.name !== undefined) product.name = dto.name;
    if (dto.shortDescription !== undefined) {
      product.shortDescription = dto.shortDescription;
    }
    if (dto.rawDescription !== undefined) {
      product.rawDescription = dto.rawDescription;
    }
    if (dto.price !== undefined) product.price = String(dto.price);
    if (dto.status !== undefined) product.status = dto.status;
    if (dto.isFeatured !== undefined) product.isFeatured = dto.isFeatured;
    if (dto.sku !== undefined) product.sku = dto.sku.trim();

    if (dto.slug !== undefined) {
      product.slug = await this.ensureUniqueSlug(this.slugify(dto.slug), id);
    } else if (dto.name !== undefined) {
      product.slug = await this.ensureUniqueSlug(this.slugify(dto.name), id);
    }

    const saved = await this.productRepo.save(product);
    return ResponseCommon.ok(saved, 'UPDATE_PRODUCT_SUCCESS');
  }

  async softDeleteProduct(
    id: string,
  ): Promise<ResponseCommon<{ id: string; deleted_at: Date }>> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      await queryRunner.startTransaction();

      const product = await queryRunner.manager.findOne(Product, {
        where: { id },
        select: { id: true },
      });

      if (!product) {
        throw new NotFoundException('PRODUCT_NOT_FOUND');
      }

      const now = new Date();
      await queryRunner.manager.softDelete(Product, id);

      await queryRunner.commitTransaction();
      return ResponseCommon.ok(
        { id, deleted_at: now },
        'DELETE_PRODUCT_SUCCESS',
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private slugify(text: string): string {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  private async initializeSku(): Promise<string> {
    let sku = '';
    do {
      sku = `AS-${Date.now().toString(36).toUpperCase()}${Math.random()
        .toString(36)
        .slice(2, 5)
        .toUpperCase()}`;
    } while (
      await this.productRepo.exists({ where: { sku }, withDeleted: true })
    );
    return sku;
  }

  private async ensureUniqueSlug(
    base: string,
    excludeId?: string,
  ): Promise<string> {
    const normalized = this.slugify(base);
    if (!normalized) {
      throw new BadRequestException('INVALID_SLUG');
    }

    let slug = normalized;
    let suffix = 0;

    while (true) {
      const existing = await this.productRepo.findOne({
        where: { slug },
        withDeleted: true,
      });
      if (!existing || existing.id === excludeId) {
        return slug;
      }
      suffix += 1;
      slug = `${normalized}-${suffix}`;
    }
  }
}
