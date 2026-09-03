import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { ResponseCommon } from 'src/common/dto/response.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  findAll() {
    return this.categoryRepo
      .find({
        where: { isActive: true, deleted_at: IsNull() },
        order: { sortOrder: 'ASC', name: 'ASC' },
      })
      .then((data) => ResponseCommon.ok(data, 'GET_LIST_CATEGORY_SUCCESS'));
  }
}
