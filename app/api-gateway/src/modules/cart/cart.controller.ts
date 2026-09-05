import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../core/auth/decorators/public.decorator';
import { CartService } from './cart.service';
import { AddToCartDto, MergeCartDto, UpdateCartItemDto } from './dto/cart.dto';

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  private extractIdentifiers(req: any, sessionIdHeader?: string) {
    const userId = req.user?.id;
    const sessionId = sessionIdHeader || req.headers['x-session-id'];
    return { userId, sessionId };
  }

  @Public()
  @Get()
  getCart(
    @Req() req: any,
    @Headers('x-session-id') sessionIdHeader?: string,
  ) {
    const { userId, sessionId } = this.extractIdentifiers(req, sessionIdHeader);
    return this.cartService.getCart(userId, sessionId);
  }

  @Public()
  @Post('items')
  addToCart(
    @Body() dto: AddToCartDto,
    @Req() req: any,
    @Headers('x-session-id') sessionIdHeader?: string,
  ) {
    const { userId, sessionId } = this.extractIdentifiers(req, sessionIdHeader);
    return this.cartService.addToCart(dto, userId, sessionId);
  }

  @Public()
  @Patch('items/:productId')
  updateQuantity(
    @Param('productId') productId: string,
    @Body() dto: UpdateCartItemDto,
    @Req() req: any,
    @Headers('x-session-id') sessionIdHeader?: string,
  ) {
    const { userId, sessionId } = this.extractIdentifiers(req, sessionIdHeader);
    return this.cartService.updateQuantity(productId, dto, userId, sessionId);
  }

  @Public()
  @Delete('items/:productId')
  removeItem(
    @Param('productId') productId: string,
    @Req() req: any,
    @Headers('x-session-id') sessionIdHeader?: string,
  ) {
    const { userId, sessionId } = this.extractIdentifiers(req, sessionIdHeader);
    return this.cartService.removeItem(productId, userId, sessionId);
  }

  @Public()
  @Delete()
  clearCart(
    @Req() req: any,
    @Headers('x-session-id') sessionIdHeader?: string,
  ) {
    const { userId, sessionId } = this.extractIdentifiers(req, sessionIdHeader);
    return this.cartService.clearCart(userId, sessionId);
  }

  @Post('merge')
  mergeCart(@Body() dto: MergeCartDto, @Req() req: any) {
    const userId = req.user?.id;
    return this.cartService.mergeCart(dto.guestSessionId, userId);
  }
}
