import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from 'src/common/constants';
import { Role } from '../core/auth/decorators/role.decorator';
import { RoleGuard } from '../core/auth/guards/role.guard';
import { CreateProductDto } from '../products/dto/create-product.dto';
import { QueryProductsDto } from '../products/dto/query-products.dto';
import { UpdateProductDto } from '../products/dto/update-product.dto';
import { ProductsService } from '../products/products.service';

@ApiTags('admin-products')
@ApiBearerAuth()
@Controller('admin/products')
@UseGuards(RoleGuard)
@Role(UserRole.ADMIN)
export class AdminProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'List products (admin, all statuses)' })
  findAll(@Query() query: QueryProductsDto) {
    return this.productsService.findAllAdmin(query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create product (admin)' })
  create(@Body() dto: CreateProductDto) {
    return this.productsService.createProduct(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by id (admin, any status)' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOneAdmin(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update product (admin)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.updateProduct(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete product (admin)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.softDeleteProduct(id);
  }
}
