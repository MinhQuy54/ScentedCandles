import { Injectable } from '@nestjs/common';
import { CreateRefreshTokenDto } from './dto/create-refresh-token.dto';
import { UpdateRefreshTokenDto } from './dto/update-refresh-token.dto';

@Injectable()
export class RefreshTokensService {
  create(createRefreshTokenDto: CreateRefreshTokenDto) {
    return 'This action adds a new refreshToken';
  }

  findAll() {
    return `This action returns all refreshTokens`;
  }

  findOne(id: number) {
    return `This action returns a #${id} refreshToken`;
  }

  update(id: number, updateRefreshTokenDto: UpdateRefreshTokenDto) {
    return `This action updates a #${id} refreshToken`;
  }

  remove(id: number) {
    return `This action removes a #${id} refreshToken`;
  }
}
