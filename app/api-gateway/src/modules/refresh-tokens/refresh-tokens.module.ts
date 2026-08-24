import { Module } from '@nestjs/common';
import { RefreshTokensService } from './refresh-tokens.service';
import { RefreshTokensController } from './refresh-tokens.controller';

@Module({
  controllers: [RefreshTokensController],
  providers: [RefreshTokensService],
})
export class RefreshTokensModule {}
