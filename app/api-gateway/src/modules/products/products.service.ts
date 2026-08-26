import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { ProductStatus } from 'src/common/constants';
import { ResponseCommon } from 'src/common/dto/response.dto';
import { Product } from './entities/product.entity';
import { QueryProductsDto } from './dto/query-products.dto';
import { OutProductListDto } from './dto/out-product-list.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
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
}
