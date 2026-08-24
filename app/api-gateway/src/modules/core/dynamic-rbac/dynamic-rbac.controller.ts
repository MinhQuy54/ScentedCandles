import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DynamicRbacService } from './dynamic-rbac.service';
import { CreateDynamicRbacDto } from './dto/create-dynamic-rbac.dto';
import { UpdateDynamicRbacDto } from './dto/update-dynamic-rbac.dto';

@Controller('dynamic-rbac')
export class DynamicRbacController {
  constructor(private readonly dynamicRbacService: DynamicRbacService) {}

  @Post()
  create(@Body() createDynamicRbacDto: CreateDynamicRbacDto) {
    return this.dynamicRbacService.create(createDynamicRbacDto);
  }

  @Get()
  findAll() {
    return this.dynamicRbacService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dynamicRbacService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDynamicRbacDto: UpdateDynamicRbacDto) {
    return this.dynamicRbacService.update(+id, updateDynamicRbacDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dynamicRbacService.remove(+id);
  }
}
