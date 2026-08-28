import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResponseCommon } from 'src/common/dto/response.dto';
import { Product } from '../products/entities/product.entity';
import { LocalStorageService } from '../storage/local-storage.service';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { ProductImage } from './entities/product-image.entity';

@Injectable()
export class ProductImagesService {
  constructor(
    @InjectRepository(ProductImage)
    private readonly productImageRepo: Repository<ProductImage>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    private readonly storage: LocalStorageService,
  ) {}

  async uploadAndAttach(
    productId: string,
    file: Express.Multer.File,
    dto: CreateProductImageDto,
  ): Promise<ResponseCommon<ProductImage>> {
    const product = await this.productRepo.findOne({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException('PRODUCT_NOT_FOUND');
    }

    const stored = await this.storage.upload(file.buffer, file.originalname);
    const isPrimary = dto.isPrimary ?? true;

    if (isPrimary) {
      await this.productImageRepo.update({ productId }, { isPrimary: false });
    }

    const image = this.productImageRepo.create({
      productId,
      url: stored.url,
      altText: dto.altText ?? product.name,
      isPrimary,
    });

    const saved = await this.productImageRepo.save(image);
    return ResponseCommon.created(saved, 'CREATE_PRODUCT_IMAGE_SUCCESS');
  }
}
