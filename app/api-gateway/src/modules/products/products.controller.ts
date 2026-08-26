import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../core/auth/decorators/public.decorator';
import { ProductsService } from './products.service';
import { QueryProductsDto } from './dto/query-products.dto';
import {
  ProductDetailResponseDto,
  ProductListResponseDto,
} from './dto/out-product-list.dto';

@ApiTags('products')
@Public()
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'List active products (public)' })
  @ApiOkResponse({ type: ProductListResponseDto })
  findAll(@Query() query: QueryProductsDto) {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get active product by id (public)' })
  @ApiOkResponse({ type: ProductDetailResponseDto })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(id);
  }
}
