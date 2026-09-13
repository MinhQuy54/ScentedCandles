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
  ) { }

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

  async setPrimaryImage(imageId: string) {
    const image = await this.productImageRepo.findOne({
      where: { id: imageId }
    });

    if (!image) {
      throw new NotFoundException('IMAGE_NOT_FOUND');
    }

    await this.productImageRepo.update({ productId: image.productId }, { isPrimary: false });

    image.isPrimary = true;
    await this.productImageRepo.save(image);

    return ResponseCommon.created(image, 'SET_PRIMARY_IMAGE_SUCCESS');
  }

  async deleteImage(imageId: string) {
    const image = await this.productImageRepo.findOne({
      where: { id: imageId },
    });

    if (!image) {
      throw new NotFoundException('IMAGE_NOT_FOUND');
    }

    await this.productImageRepo.remove(image);

    // Nếu ảnh vừa xóa là primary, tự chọn 1 ảnh còn lại làm primary
    if (image.isPrimary) {
      const remaining = await this.productImageRepo.findOne({
        where: { productId: image.productId },
        order: { createdAt: 'ASC' },
      });
      if (remaining) {
        remaining.isPrimary = true;
        await this.productImageRepo.save(remaining);
      }
    }

    return ResponseCommon.ok({ id: imageId }, 'DELETE_PRODUCT_IMAGE_SUCCESS');
  }

  async sortIndexImage(imageId: string, sortOrder: number) {
    const image = await this.productImageRepo.findOne({
      where: { id: imageId },
    });

    if (!image) {
      throw new NotFoundException('IMAGE_NOT_FOUND');
    }

    image.sortOrder = sortOrder;
    const saved = await this.productImageRepo.save(image);

    return ResponseCommon.ok(saved, 'SORT_PRODUCT_IMAGE_SUCCESS');
  }

  async reorderImages(productId: string, imageIds: string[]) {
    const images = await this.productImageRepo.find({
      where: { productId },
    });

    const updates = imageIds.map((id, index) => {
      const img = images.find((i) => i.id === id);
      if (img) {
        img.sortOrder = index;
        return this.productImageRepo.save(img);
      }
      return Promise.resolve(null);
    });

    await Promise.all(updates);

    return ResponseCommon.ok({ productId }, 'REORDER_PRODUCT_IMAGES_SUCCESS');
  }
}
