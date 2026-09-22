import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from 'src/common/constants';
import { Role } from '../core/auth/decorators/role.decorator';
import { RoleGuard } from '../core/auth/guards/role.guard';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';
import { OrdersService } from './orders.service';
import { SepayWebhookDto } from './dto/sepay-webhook.dto';
import { Public } from '../core/auth/decorators/public.decorator';

@ApiTags('orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @Post()
  @ApiOperation({ summary: 'Create new order (Checkout)' })
  createOrder(@Body() dto: CreateOrderDto, @Req() req: any) {
    return this.ordersService.createOrder(req.user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get current user orders' })
  getUserOrders(@Req() req: any) {
    return this.ordersService.getUserOrders(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order details by id' })
  getOrderById(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.ordersService.getOrderById(req.user.userId, id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel order' })
  cancelOrder(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.ordersService.cancelOrder(req.user.userId, id);
  }
}

@ApiTags('admin-orders')
@ApiBearerAuth()
@Controller('admin/orders')
@UseGuards(RoleGuard)
@Role(UserRole.ADMIN)
export class AdminOrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @Get()
  @ApiOperation({ summary: 'Get all orders (admin)' })
  adminGetOrders() {
    return this.ordersService.adminGetOrders();
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status (admin)' })
  adminUpdateOrderStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.adminUpdateOrderStatus(id, dto);
  }
}

@ApiTags('payments-webhook')
@Controller('payments')
export class PaymentsWebhookController {
  constructor(private readonly ordersService: OrdersService) { }
  @Public()
  @Post('vietqr-webhook')
  @ApiOperation({ summary: 'Webhook nhận thông báo thanh toán tự động từ SePAY / VietQR' })
  async handleSepayWebhook(
    @Body() dto: SepayWebhookDto,
    @Req() req: any,
  ) {
    const authHeader = (req.headers['authorization'] || req.headers['Authorization'] || '') as string;
    const expectedApiKey = (process.env.SEPAY_WEBHOOK_API_KEY || 'AuraScent_Secret_Key_2026').trim();

    if (!authHeader || !authHeader.includes(expectedApiKey)) {
      console.error(`[Sepay Webhook Error] Header received: "${authHeader}", Expected containing: "${expectedApiKey}"`);
      throw new UnauthorizedException(`Secret API Key không hợp lệ! Header nhận được: "${authHeader}"`);
    }
    return this.ordersService.handleSepayWebhook(dto);
  }
}

