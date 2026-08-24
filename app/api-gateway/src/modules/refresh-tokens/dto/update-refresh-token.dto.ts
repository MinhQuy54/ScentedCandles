import { PartialType } from '@nestjs/mapped-types';
import { CreateRefreshTokenDto } from './create-refresh-token.dto';

export class UpdateRefreshTokenDto extends PartialType(CreateRefreshTokenDto) {}
