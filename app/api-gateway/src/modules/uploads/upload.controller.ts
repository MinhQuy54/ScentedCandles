import {
  BadRequestException,
  Controller,
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
import { ResponseCommon } from 'src/common/dto/response.dto';
import { Role } from '../core/auth/decorators/role.decorator';
import { RoleGuard } from '../core/auth/guards/role.guard';
import { LocalStorageService } from '../storage/local-storage.service';
import type { StoredFile } from '../storage/storage.type';
import { UploadResponseDto } from './dto/upload-response.dto';

@ApiTags('admin-uploads')
@ApiBearerAuth()
@Controller('admin/uploads')
@UseGuards(RoleGuard)
@Role(UserRole.ADMIN)
export class UploadController {
  constructor(private readonly storage: LocalStorageService) {}

  @Post()
  @ApiOperation({ summary: 'Upload product image (admin)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOkResponse({ type: UploadResponseDto })
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
  async upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('FILE_REQUIRED');
    }

    const stored = await this.storage.upload(file.buffer, file.originalname);
    return ResponseCommon.ok<StoredFile>(stored, 'UPLOAD_SUCCESS');
  }
}
