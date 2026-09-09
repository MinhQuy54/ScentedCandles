import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AddressService } from './address.service';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';

@ApiTags('addresses')
@ApiBearerAuth()
@Controller('addresses')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  @ApiOperation({ summary: 'Create shipping address' })
  create(@Body() dto: CreateAddressDto, @Req() req: any) {
    return this.addressService.create(req.user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all addresses of logged in user' })
  findAll(@Req() req: any) {
    return this.addressService.findAllByUser(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single address by id' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.addressService.findOne(req.user.userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update address' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAddressDto,
    @Req() req: any,
  ) {
    return this.addressService.update(req.user.userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete address' })
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.addressService.remove(req.user.userId, id);
  }

  @Patch(':id/default')
  @ApiOperation({ summary: 'Set address as default' })
  setDefault(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.addressService.setDefault(req.user.userId, id);
  }
}
