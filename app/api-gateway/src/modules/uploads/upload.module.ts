import { Module } from '@nestjs/common';
import { StorageModule } from '../storage/storage.module';
import { RoleGuard } from '../core/auth/guards/role.guard';
import { UploadController } from './upload.controller';

@Module({
  imports: [StorageModule],
  controllers: [UploadController],
  providers: [RoleGuard],
})
export class UploadModule {}
