import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UserRole } from 'src/common/constants';
import { Role } from '../core/auth/decorators/role.decorator';
import { RoleGuard } from '../core/auth/guards/role.guard';
import { CreateProductImageDto } from '../product-images/dto/create-product-image.dto';
import { ProductImagesService } from '../product-images/product-images.service';

@ApiTags('admin-product-images')
@ApiBearerAuth()
@Controller('admin/products/:productId/images')
@UseGuards(RoleGuard)
@Role(UserRole.ADMIN)
export class AdminProductImagesController {
  constructor(private readonly productImagesService: ProductImagesService) { }

  @Post()
  @ApiOperation({
    summary: 'Upload file and attach to product (admin, 1 step)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary' },
        altText: { type: 'string' },
        isPrimary: { type: 'boolean', default: true },
      },
    },
  })
  @ApiOkResponse({ description: 'Uploaded and attached product image' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, callback) => {
        if (!/^image\/(jpeg|png|webp)$/.test(file.mimetype)) {
          callback(new BadRequestException('INVALID_IMAGE_TYPE'), false);
        }
        callback(null, true);
      },
    }),
  )
  uploadAndAttach(
    @Param('productId', ParseUUIDPipe) productId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateProductImageDto,
  ) {
    if (!file) {
      throw new BadRequestException('FILE_REQUIRED');
    }
    return this.productImagesService.uploadAndAttach(productId, file, dto);
  }

  @Patch(':imageId/set-primary')
  @ApiOperation({
    summary: 'Set primary product image',
  })
  @ApiOkResponse({ description: 'Product image set as primary' })
  setPrimaryImage(
    @Param('imageId', ParseUUIDPipe) imageId: string,
  ) {
    return this.productImagesService.setPrimaryImage(imageId);
  }

  @Delete(':imageId')
  @ApiOperation({
    summary: 'Delete product image',
  })
  @ApiOkResponse({ description: 'Product image deleted' })
  deleteImage(
    @Param('imageId', ParseUUIDPipe) imageId: string,
  ) {
    return this.productImagesService.deleteImage(imageId);
  }

  @Patch(':imageId/sort')
  @ApiOperation({
    summary: 'Update sort order for a single product image',
  })
  @ApiOkResponse({ description: 'Product image sort order updated' })
  sortIndexImage(
    @Param('imageId', ParseUUIDPipe) imageId: string,
    @Body('sortOrder') sortOrder: number,
  ) {
    return this.productImagesService.sortIndexImage(imageId, sortOrder ?? 0);
  }

  @Patch('reorder')
  @ApiOperation({
    summary: 'Reorder list of product images',
  })
  @ApiOkResponse({ description: 'Product images reordered' })
  reorderImages(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body('imageIds') imageIds: string[],
  ) {
    return this.productImagesService.reorderImages(productId, imageIds || []);
  }
}
