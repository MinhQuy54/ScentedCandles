import { Injectable, NotFoundException } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { ProductsService } from '../products/products.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
import { ResponseCommon } from 'src/common/dto/response.dto';

export interface RawCartItem {
  productId: string;
  quantity: number;
}

export interface PopulatedCartItem {
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    sku: string;
    price: string;
    compareAtPrice?: string;
    primaryImage: string;
  };
  lineTotal: number;
}

export interface CartData {
  items: PopulatedCartItem[];
  totalItems: number;
  totalPrice: number;
}

@Injectable()
export class CartService {
  private readonly GUEST_TTL = 30 * 24 * 3600; // 30 ngày
  private readonly USER_TTL = 90 * 24 * 3600;  // 90 ngày

  constructor(
    private readonly redisService: RedisService,
    private readonly productsService: ProductsService,
  ) {}

  private getCartKey(userId?: string, sessionId?: string): string {
    if (userId) return `cart:user:${userId}`;
    if (sessionId) return `cart:guest:${sessionId}`;
    throw new NotFoundException('CART_IDENTIFIER_MISSING');
  }

  private getTTL(userId?: string): number {
    return userId ? this.USER_TTL : this.GUEST_TTL;
  }

  private async getRawItems(key: string): Promise<RawCartItem[]> {
    const data = await this.redisService.get(key);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  private async saveItems(key: string, items: RawCartItem[], ttl: number): Promise<void> {
    await this.redisService.set(key, JSON.stringify(items), ttl);
  }

  async getCartData(userId?: string, sessionId?: string): Promise<CartData> {
    const key = this.getCartKey(userId, sessionId);
    const rawItems = await this.getRawItems(key);
    const populatedItems: PopulatedCartItem[] = [];
    let totalPrice = 0;
    let totalItems = 0;

    for (const item of rawItems) {
      try {
        const res = await this.productsService.findOne(item.productId);
        const p = res.data;
        const price = Number(p.price);
        const lineTotal = price * item.quantity;
        totalPrice += lineTotal;
        totalItems += item.quantity;

        const img = p.images?.find((i) => i.isPrimary) ?? p.images?.[0];

        populatedItems.push({
          productId: item.productId,
          quantity: item.quantity,
          product: {
            id: p.id,
            name: p.name,
            sku: p.sku,
            price: p.price,
            compareAtPrice: p.compareAtPrice,
            primaryImage: img?.url ?? 'https://placehold.co/600x600?text=AuraScent',
          },
          lineTotal,
        });
      } catch {
        // bỏ qua nếu sản phẩm bị xóa
      }
    }

    return {
      items: populatedItems,
      totalItems,
      totalPrice,
    };
  }

  async getCart(userId?: string, sessionId?: string): Promise<ResponseCommon<CartData>> {
    const cart = await this.getCartData(userId, sessionId);
    return ResponseCommon.ok(cart, 'GET_CART_SUCCESS');
  }

  async addToCart(
    dto: AddToCartDto,
    userId?: string,
    sessionId?: string,
  ): Promise<ResponseCommon<CartData>> {
    const key = this.getCartKey(userId, sessionId);
    const ttl = this.getTTL(userId);

    await this.productsService.findOne(dto.productId);

    const items = await this.getRawItems(key);
    const existingIndex = items.findIndex((i) => i.productId === dto.productId);

    if (existingIndex >= 0) {
      items[existingIndex].quantity += dto.quantity;
    } else {
      items.push({
        productId: dto.productId,
        quantity: dto.quantity,
      });
    }

    await this.saveItems(key, items, ttl);
    const cart = await this.getCartData(userId, sessionId);
    return ResponseCommon.ok(cart, 'ADD_TO_CART_SUCCESS');
  }

  async updateQuantity(
    productId: string,
    dto: UpdateCartItemDto,
    userId?: string,
    sessionId?: string,
  ): Promise<ResponseCommon<CartData>> {
    const key = this.getCartKey(userId, sessionId);
    const ttl = this.getTTL(userId);

    const items = await this.getRawItems(key);
    const item = items.find((i) => i.productId === productId);

    if (!item) {
      throw new NotFoundException('CART_ITEM_NOT_FOUND');
    }

    item.quantity = dto.quantity;
    await this.saveItems(key, items, ttl);
    const cart = await this.getCartData(userId, sessionId);
    return ResponseCommon.ok(cart, 'UPDATE_CART_SUCCESS');
  }

  async removeItem(
    productId: string,
    userId?: string,
    sessionId?: string,
  ): Promise<ResponseCommon<CartData>> {
    const key = this.getCartKey(userId, sessionId);
    const ttl = this.getTTL(userId);

    let items = await this.getRawItems(key);
    items = items.filter((i) => i.productId !== productId);

    await this.saveItems(key, items, ttl);
    const cart = await this.getCartData(userId, sessionId);
    return ResponseCommon.ok(cart, 'REMOVE_CART_ITEM_SUCCESS');
  }

  async clearCart(
    userId?: string,
    sessionId?: string,
  ): Promise<ResponseCommon<CartData>> {
    const key = this.getCartKey(userId, sessionId);
    await this.redisService.del(key);
    return ResponseCommon.ok({ items: [], totalItems: 0, totalPrice: 0 }, 'CLEAR_CART_SUCCESS');
  }

  async mergeCart(
    guestSessionId: string,
    userId: string,
  ): Promise<ResponseCommon<CartData>> {
    const guestKey = `cart:guest:${guestSessionId}`;
    const userKey = `cart:user:${userId}`;

    const guestItems = await this.getRawItems(guestKey);

    if (guestItems.length === 0) {
      const cart = await this.getCartData(userId);
      return ResponseCommon.ok(cart, 'MERGE_CART_SUCCESS');
    }

    const userItems = await this.getRawItems(userKey);
    for (const gItem of guestItems) {
      const idx = userItems.findIndex((u) => u.productId === gItem.productId);
      if (idx >= 0) {
        userItems[idx].quantity += gItem.quantity;
      } else {
        userItems.push(gItem);
      }
    }

    await this.saveItems(userKey, userItems, this.USER_TTL);
    await this.redisService.del(guestKey);

    const cart = await this.getCartData(userId);
    return ResponseCommon.ok(cart, 'MERGE_CART_SUCCESS');
  }
}
