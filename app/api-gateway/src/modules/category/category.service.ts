import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { ResponseCommon } from 'src/common/dto/response.dto';
import { Product } from '../products/entities/product.entity';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  findAll() {
    return this.categoryRepo
      .find({
        where: { isActive: true, deleted_at: IsNull() },
        order: { sortOrder: 'ASC', name: 'ASC' },
      })
      .then((data) => ResponseCommon.ok(data, 'GET_LIST_CATEGORY_SUCCESS'));
  }

  findAllAdmin() {
    return this.categoryRepo
      .find({
        order: { sortOrder: 'ASC', name: 'ASC' },
        withDeleted: true,
      })
      .then((data) => ResponseCommon.ok(data, 'GET_LIST_CATEGORY_SUCCESS'));
  }

  async findOneAdmin(id: string): Promise<ResponseCommon<Category>> {
    const category = await this.categoryRepo.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!category) {
      throw new NotFoundException('CATEGORY_NOT_FOUND');
    }
    return ResponseCommon.ok(category, 'GET_CATEGORY_SUCCESS');
  }

  async create(
    dto: CreateCategoryDto,
  ): Promise<ResponseCommon<Category>> {
    if (dto.parentId) {
      await this.assertParentExists(dto.parentId);
    }

    const category = this.categoryRepo.create({
      name: dto.name.trim(),
      slug: await this.ensureUniqueSlug(dto.slug?.trim() || dto.name),
      description: dto.description,
      imageUrl: dto.imageUrl,
      sortOrder: dto.sortOrder ?? 0,
      isActive: dto.isActive ?? true,
      parentId: dto.parentId,
    });

    const saved = await this.categoryRepo.save(category);
    return ResponseCommon.created(saved, 'CREATE_CATEGORY_SUCCESS');
  }

  async update(
    id: string,
    dto: UpdateCategoryDto,
  ): Promise<ResponseCommon<Category>> {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('CATEGORY_NOT_FOUND');
    }

    if (dto.parentId !== undefined) {
      if (dto.parentId === id) {
        throw new BadRequestException('CATEGORY_PARENT_INVALID');
      }
      if (dto.parentId) {
        await this.assertParentExists(dto.parentId);
      }
      category.parentId = dto.parentId;
    }

    if (dto.name !== undefined) {
      category.name = dto.name.trim();
    }
    if (dto.description !== undefined) {
      category.description = dto.description;
    }
    if (dto.imageUrl !== undefined) {
      category.imageUrl = dto.imageUrl;
    }
    if (dto.sortOrder !== undefined) {
      category.sortOrder = dto.sortOrder;
    }
    if (dto.isActive !== undefined) {
      category.isActive = dto.isActive;
    }

    if (dto.slug !== undefined) {
      category.slug = await this.ensureUniqueSlug(dto.slug, id);
    } else if (dto.name !== undefined) {
      category.slug = await this.ensureUniqueSlug(dto.name, id);
    }

    const saved = await this.categoryRepo.save(category);
    return ResponseCommon.ok(saved, 'UPDATE_CATEGORY_SUCCESS');
  }

  async softDelete(
    id: string,
  ): Promise<ResponseCommon<{ id: string; deleted_at: Date }>> {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('CATEGORY_NOT_FOUND');
    }

    const productCount = await this.productRepo.count({
      where: { categoryId: id },
    });
    if (productCount > 0) {
      throw new BadRequestException('CATEGORY_IN_USE');
    }

    const result = await this.categoryRepo.softDelete(id);
    if (!result.affected) {
      throw new NotFoundException('CATEGORY_NOT_FOUND');
    }

    return ResponseCommon.ok(
      { id, deleted_at: new Date() },
      'DELETE_CATEGORY_SUCCESS',
    );
  }

  private async assertParentExists(parentId: string): Promise<void> {
    const parent = await this.categoryRepo.findOne({
      where: { id: parentId, deleted_at: IsNull() },
    });
    if (!parent) {
      throw new BadRequestException('PARENT_CATEGORY_NOT_FOUND');
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
      const existing = await this.categoryRepo.findOne({
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
