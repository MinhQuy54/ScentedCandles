import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../core/auth/decorators/public.decorator';
import { CategoryService } from './category.service';

@ApiTags('categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List active categories (public)' })
  @ApiOkResponse({ description: 'Category list' })
  findAll() {
    return this.categoryService.findAll();
  }
}
