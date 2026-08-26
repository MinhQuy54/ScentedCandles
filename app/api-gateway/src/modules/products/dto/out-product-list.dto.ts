import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductImageItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  url: string;

  @ApiPropertyOptional()
  altText?: string;

  @ApiProperty()
  sortOrder: number;

  @ApiProperty()
  isPrimary: boolean;
}

export class ProductCategoryItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;
}

export class ProductItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  categoryId: string;

  @ApiProperty()
  sku: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiPropertyOptional()
  shortDescription?: string;

  @ApiProperty()
  rawDescription: string;

  @ApiProperty({ example: '250000.00' })
  price: string;

  @ApiPropertyOptional()
  compareAtPrice?: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  isFeatured: boolean;

  @ApiPropertyOptional({ type: ProductCategoryItemDto })
  category?: ProductCategoryItemDto;

  @ApiPropertyOptional({ type: ProductImageItemDto, isArray: true })
  images?: ProductImageItemDto[];
}

export class OutProductListDto {
  @ApiProperty({ type: ProductItemDto, isArray: true })
  data: ProductItemDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}

export class ProductListResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty()
  code: number;

  @ApiProperty({ type: OutProductListDto })
  data: OutProductListDto;
}

export class ProductDetailResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty()
  code: number;

  @ApiProperty({ type: ProductItemDto })
  data: ProductItemDto;
}
