import {
  BadRequestException,
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
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
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { ProductImagesService } from './product-images.service';

@ApiTags('admin-product-images')
@ApiBearerAuth()
@Controller('admin/products/:productId/images')
@UseGuards(RoleGuard)
@Role(UserRole.ADMIN)
export class AdminProductImagesController {
  constructor(private readonly productImagesService: ProductImagesService) {}

  @Post()
  @ApiOperation({ summary: 'Upload file and attach to product (admin, 1 step)' })
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
          return;
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
}
