import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from 'src/common/constants';
import { Public } from '../core/auth/decorators/public.decorator';
import { Role } from '../core/auth/decorators/role.decorator';
import { RoleGuard } from '../core/auth/guards/role.guard';
import { AdjustInventoryDto, UpdateInventoryDto } from './dto/inventory.dto';
import { InventoryService } from './inventory.service';

@ApiTags('inventory')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Public()
  @Get('product/:productId')
  @ApiOperation({ summary: 'Get stock information for a product (public)' })
  getInventory(@Param('productId', ParseUUIDPipe) productId: string) {
    return this.inventoryService.getInventory(productId);
  }
}

@ApiTags('admin-inventory')
@ApiBearerAuth()
@Controller('admin/inventory')
@UseGuards(RoleGuard)
@Role(UserRole.ADMIN)
export class AdminInventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @ApiOperation({ summary: 'Get all inventory items (admin)' })
  getAllInventory() {
    return this.inventoryService.getAllInventory();
  }

  @Get('product/:productId/transactions')
  @ApiOperation({ summary: 'Get inventory transactions log (admin)' })
  getTransactions(@Param('productId', ParseUUIDPipe) productId: string) {
    return this.inventoryService.getTransactions(productId);
  }

  @Patch('product/:productId')
  @ApiOperation({ summary: 'Set total stock for a product (admin)' })
  setStock(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() dto: UpdateInventoryDto,
    @Req() req: any,
  ) {
    return this.inventoryService.setStock(productId, dto, req.user?.userId);
  }

  @Post('product/:productId/adjust')
  @ApiOperation({ summary: 'Adjust stock up/down for a product (admin)' })
  adjustStock(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() dto: AdjustInventoryDto,
    @Req() req: any,
  ) {
    return this.inventoryService.adjustStock(productId, dto, req.user?.userId);
  }
}
