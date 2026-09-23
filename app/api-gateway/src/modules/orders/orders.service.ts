import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderStatus, PaymentStatus, ProductStatus } from 'src/common/constants';
import { AddressService } from 'src/modules/addresses/address.service';
import { CartService } from 'src/modules/cart/cart.service';
import { InventoryService } from 'src/modules/inventory/inventory.service';
import { Product } from 'src/modules/products/entities/product.entity';
import { RedisService } from 'src/modules/redis/redis.service';
import { DataSource, Repository } from 'typeorm';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';
import { ResponseCommon } from 'src/common/dto/response.dto';
import { SepayWebhookDto } from './dto/sepay-webhook.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    private readonly inventoryService: InventoryService,
    private readonly addressService: AddressService,
    private readonly cartService: CartService,
    private readonly redisService: RedisService,
    private readonly dataSource: DataSource,
  ) { }

  async handleSepayWebhook(dto: SepayWebhookDto): Promise<{
    success: boolean; message: string
  }> {
    try {
      if (dto.transferType !== 'in') {
        return {
          success: true, message: 'Bỏ qua giao dịch tiền ra'
        };
      }

      let order: Order | null = null;

      // 1. Primary match: ORD followed by 6 digits and 3 digits (e.g. ORD-420312-582 or ORD420312582)
      const formattedMatch = dto.content.match(/ORD[-_\s]?(\d{6})[-_\s]?(\d{3})/i);
      if (formattedMatch) {
        const orderNumber = `ORD-${formattedMatch[1]}-${formattedMatch[2]}`;
        order = await this.orderRepo.findOne({
          where: { orderNumber },
        });
      }

      if (!order) {
        const ordMatch = dto.content.match(/ORD[-_\s]?\d+[-_\s]?\d+/i);
        if (ordMatch) {
          const rawOrd = ordMatch[0].toUpperCase().replace(/\s+/g, '-');
          order = await this.orderRepo.findOne({
            where: { orderNumber: rawOrd },
          });
        }
      }

      if (!order) {
        const pendingOrders = await this.orderRepo.find({
          where: { paymentStatus: PaymentStatus.PENDING },
          order: { created_at: 'DESC' },
        });

        for (const pOrder of pendingOrders) {
          const totalAmountNum = parseFloat(pOrder.totalAmount);
          if (Math.abs(totalAmountNum - dto.transferAmount) < 1) {
            const cleanPhone = (pOrder.shippingPhone || '').replace(/\D/g, '');
            const phoneWithoutZero = cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone;

            if (
              (cleanPhone && dto.content.includes(cleanPhone)) ||
              (phoneWithoutZero && dto.content.includes(phoneWithoutZero)) ||
              (dto.content.toLowerCase().includes('aurascent') && pendingOrders.length === 1)
            ) {
              order = pOrder;
              console.log(`[Sepay Webhook Fallback] Matched order ${order.orderNumber} via phone (${pOrder.shippingPhone}) & amount (${totalAmountNum})`);
              break;
            }
          }
        }
      }

      if (!order) {
        console.warn(`[Sepay Webhook Warning] Không tìm thấy đơn hàng cho giao dịch content: "${dto.content}", amount: ${dto.transferAmount}`);
        return {
          success: true,
          message: 'Không tìm thấy đơn hàng tương ứng với nội dung giao dịch'
        };
      }

      if (order.paymentStatus === PaymentStatus.PAID) {
        return { success: true, message: `Đơn hàng ${order.orderNumber} đã được thanh toán từ trước.` };
      }

      const totalAmountNum = parseFloat(order.totalAmount);

      if (dto.transferAmount < totalAmountNum) {
        throw new BadRequestException(
          `Số tiền chuyển (${dto.transferAmount}) ít hơn tổng tiền đơn hàng (${totalAmountNum})`,
        );
      }

      order.paymentStatus = PaymentStatus.PAID;
      order.status = OrderStatus.PROCESSING;

      await this.orderRepo.save(order);
      console.log(`[VietQR Webhook] Đơn hàng ${order.orderNumber} đã tự động đổi trạng thái sang PAID!`);
      return {
        success: true,
        message: `Thanh toán thành công cho đơn hàng ${order.orderNumber}`,
      };
    } catch (err: any) {
      console.error('[Sepay Webhook Handler Error]', err);
      return {
        success: false,
        message: err.message || 'Lỗi hệ thống khi xử lý webhook',
      };
    }
  }

  async createOrder(userId: string, dto: CreateOrderDto): Promise<ResponseCommon<Order>> {
    let recipientName = dto.recipientName;
    let phone = dto.phone;
    let streetAddress = dto.streetAddress;
    let ward = dto.ward;
    let district = dto.district;
    let city = dto.city;

    if (dto.addressId) {
      const { data: addr } = await this.addressService.findOne(userId, dto.addressId);
      if (!addr) {
        throw new BadRequestException('Address not found');
      }
      recipientName = addr.recipientName;
      phone = addr.phone;
      streetAddress = addr.streetAddress;
      ward = addr.ward;
      district = addr.district;
      city = addr.city;
    } else if (!recipientName || !phone || !streetAddress || !ward || !district || !city) {
      throw new BadRequestException('Shipping address is required');
    }

    const sortedItems = [...dto.items].sort((a, b) =>
      a.productId.localeCompare(b.productId),
    );

    //  Acquire Redis Distributed Lock
    const acquiredLocks: { key: string; lockValue: string }[] = [];
    try {
      for (const item of sortedItems) {
        const lockKey = `lock:product:${item.productId}`;

        const lockValue = await this.redisService.acquireLock(
          lockKey,
          5000,
        );

        if (!lockValue) {
          throw new ConflictException(
            'Hệ thống đang bận xử lý đơn hàng cho sản phẩm này. Vui lòng thử lại sau giây lát.',
          );
        }

        acquiredLocks.push({ key: lockKey, lockValue });
      }

      // Check stock & create order inside DB Transaction
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        let subtotalNum = 0;
        const orderItemsToSave: Partial<OrderItem>[] = [];
        const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

        for (const item of sortedItems) {
          const product = await queryRunner.manager.findOne(Product, {
            where: { id: item.productId, status: ProductStatus.ACTIVE },
          });

          if (!product) {
            throw new BadRequestException(`Sản phẩm không tồn tại hoặc đã ngừng bán.`);
          }

          // Lock inventory row & reserve stock
          await this.inventoryService.reserveStockInTx(
            queryRunner,
            item.productId,
            item.quantity,
            orderNumber,
            userId,
          );

          const lineTotal = Number(product.price) * item.quantity;
          subtotalNum += lineTotal;

          orderItemsToSave.push({
            productId: product.id,
            productName: product.name,
            productSku: product.sku,
            unitPrice: product.price,
            quantity: item.quantity,
            totalPrice: lineTotal.toFixed(2),
          });
        }

        const shippingFeeNum = subtotalNum >= 990000 ? 0 : 30000;
        const totalAmountNum = subtotalNum + shippingFeeNum;

        const newOrder = queryRunner.manager.create(Order, {
          orderNumber,
          userId,
          status: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,
          paymentMethod: dto.paymentMethod,
          shippingRecipientName: recipientName,
          shippingPhone: phone,
          shippingStreetAddress: streetAddress,
          shippingWard: ward,
          shippingDistrict: district,
          shippingCity: city,
          subtotal: subtotalNum.toFixed(2),
          shippingFee: shippingFeeNum.toFixed(2),
          discountAmount: '0.00',
          totalAmount: totalAmountNum.toFixed(2),
          note: dto.note,
        });

        const savedOrder = await queryRunner.manager.save(newOrder);

        const itemsWithOrderId = orderItemsToSave.map((item) =>
          queryRunner.manager.create(OrderItem, {
            ...item,
            orderId: savedOrder.id,
          }),
        );
        await queryRunner.manager.save(itemsWithOrderId);

        await queryRunner.commitTransaction();

        // Clear Redis cart for logged-in user
        await this.cartService.clearCart(userId).catch(() => null);

        const paymentInfo = this.getVietQrPaymentInfo(savedOrder.orderNumber, totalAmountNum);
        return ResponseCommon.created({ ...savedOrder, paymentInfo }, 'CREATE_ORDER_SUCCESS');
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
      } finally {
        await queryRunner.release();
      }
    } finally {
      // 5. Release all Redis locks
      for (const lock of acquiredLocks.reverse()) {
        await this.redisService.releaseLock(lock.key, lock.lockValue).catch(() => null);
      }
    }
  }

  getVietQrPaymentInfo(orderNumber: string, amount: number) {
    const bankId = process.env.VIETQR_BANK_ID || 'MB';
    const accountNo = process.env.VIETQR_ACCOUNT_NO || '000000000000';
    const accountName = process.env.VIETQR_ACCOUNT_NAME || 'NGO MINH QUY';

    const qrCodeUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${amount}&addInfo=${orderNumber}&accountName=${encodeURIComponent(accountName)}`;

    return {
      bankId,
      accountNo,
      accountName,
      transferContent: orderNumber,
      amount,
      qrCodeUrl,
    };
  }

  async getUserOrders(userId: string): Promise<ResponseCommon<Order[]>> {
    const data = await this.orderRepo.find({
      where: { userId },
      relations: { items: { product: { images: true } } },
      order: { created_at: 'DESC' },
    });
    return ResponseCommon.ok(data, 'OK');
  }

  async getOrderById(userId: string, orderId: string): Promise<ResponseCommon<any>> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId, userId },
      relations: { items: { product: true } },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }
    const paymentInfo = this.getVietQrPaymentInfo(order.orderNumber, parseFloat(order.totalAmount));
    return ResponseCommon.ok({ ...order, paymentInfo }, 'OK');
  }

  async cancelOrder(userId: string, orderId: string): Promise<ResponseCommon<Order>> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId, userId },
      relations: { items: { product: true } },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (
      order.status !== OrderStatus.PENDING &&
      order.status !== OrderStatus.PROCESSING
    ) {
      throw new BadRequestException(
        `Cannot cancel order with status ${order.status}`,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const isAlreadyCommitted = order.status === OrderStatus.PROCESSING;

      // Refund / Release stock for items
      for (const item of order.items || []) {
        await this.inventoryService.releaseStockInTx(
          queryRunner,
          item.productId,
          item.quantity,
          order.orderNumber,
          isAlreadyCommitted,
          userId,
        );
      }

      order.status = OrderStatus.CANCELLED;
      const updatedOrder = await queryRunner.manager.save(order);
      await queryRunner.commitTransaction();

      return ResponseCommon.ok(updatedOrder, 'CANCEL_ORDER_SUCCESS');
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // Admin methods
  async adminGetOrders(): Promise<ResponseCommon<Order[]>> {
    const data = await this.orderRepo.find({
      relations: { items: true, user: true },
      order: { created_at: 'DESC' },
    });
    return ResponseCommon.ok(data, 'OK');
  }

  async adminUpdateOrderStatus(
    orderId: string,
    dto: UpdateOrderStatusDto,
  ): Promise<ResponseCommon<Order>> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: { items: true },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (dto.status === OrderStatus.CANCELLED && order.status !== OrderStatus.CANCELLED) {
      return this.cancelOrder(order.userId, orderId);
    }

    // When staff confirms/processes order for the first time (PENDING -> PROCESSING/SHIPPED), commit inventory stock
    if (
      order.status === OrderStatus.PENDING &&
      (dto.status === OrderStatus.PROCESSING || dto.status === OrderStatus.SHIPPED)
    ) {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      try {
        for (const item of order.items || []) {
          await this.inventoryService.commitStockInTx(
            queryRunner,
            item.productId,
            item.quantity,
            order.orderNumber,
          );
        }
        order.status = dto.status;
        const savedOrder = await queryRunner.manager.save(order);
        await queryRunner.commitTransaction();
        return ResponseCommon.ok(savedOrder, 'UPDATE_ORDER_STATUS_SUCCESS');
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
      } finally {
        await queryRunner.release();
      }
    }

    order.status = dto.status;
    if (dto.status === OrderStatus.DELIVERED) {
      order.paymentStatus = PaymentStatus.PAID;
    }
    const saved = await this.orderRepo.save(order);
    return ResponseCommon.ok(saved, 'UPDATE_ORDER_STATUS_SUCCESS');
  }
}
