import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RefreshTokensService } from './refresh-tokens.service';
import { CreateRefreshTokenDto } from './dto/create-refresh-token.dto';
import { UpdateRefreshTokenDto } from './dto/update-refresh-token.dto';

@Controller('refresh-tokens')
export class RefreshTokensController {
  constructor(private readonly refreshTokensService: RefreshTokensService) {}

  @Post()
  create(@Body() createRefreshTokenDto: CreateRefreshTokenDto) {
    return this.refreshTokensService.create(createRefreshTokenDto);
  }

  @Get()
  findAll() {
    return this.refreshTokensService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.refreshTokensService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRefreshTokenDto: UpdateRefreshTokenDto) {
    return this.refreshTokensService.update(+id, updateRefreshTokenDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.refreshTokensService.remove(+id);
  }
}
