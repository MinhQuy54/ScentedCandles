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

  async createOrder(userId: string, dto: CreateOrderDto): Promise<Order> {
    let recipientName = dto.recipientName;
    let phone = dto.phone;
    let streetAddress = dto.streetAddress;
    let ward = dto.ward;
    let district = dto.district;
    let city = dto.city;

    if (dto.addressId) {
      const addr = await this.addressService.findOne(userId, dto.addressId);
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
        let lockValue: string | null = null;
        let attempts = 0;

        while (attempts < 5) {
          lockValue = await this.redisService.acquireLock(lockKey, 5000);
          if (lockValue) break;
          attempts++;
          await new Promise((res) => setTimeout(res, 100)); // wait 100ms before retry
        }

        if (!lockValue) {
          throw new ConflictException(
            `Product ${item.productId} is currently being processed by another order. Please try again.`,
          );
        }

        acquiredLocks.push({ key: lockKey, lockValue });
      }

      // 4. Run DB Transaction with Pessimistic Locking
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        const orderNumber = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
        let subtotalNum = 0;
        const orderItemsToSave: Partial<OrderItem>[] = [];

        for (const item of sortedItems) {
          const product = await queryRunner.manager.findOne(Product, {
            where: { id: item.productId },
          });

          if (!product || product.status !== ProductStatus.ACTIVE) {
            throw new BadRequestException(
              `Product ${item.productId} is unavailable`,
            );
          }

          // Reserve stock within transaction with SELECT FOR UPDATE
          await this.inventoryService.reserveStockInTx(
            queryRunner,
            item.productId,
            item.quantity,
            orderNumber,
            userId,
          );

          const price = parseFloat(product.price);
          const lineTotal = price * item.quantity;
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

        const shippingFeeNum = subtotalNum >= 500000 ? 0 : 30000;
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

        return savedOrder;
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

  async getUserOrders(userId: string): Promise<Order[]> {
    return this.orderRepo.find({
      where: { userId },
      relations: { items: true },
      order: { created_at: 'DESC' },
    });
  }

  async getOrderById(userId: string, orderId: string): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId, userId },
      relations: { items: { product: true } },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async cancelOrder(userId: string, orderId: string): Promise<Order> {
    const order = await this.getOrderById(userId, orderId);

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

      return updatedOrder;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // Admin methods
  async adminGetOrders(): Promise<Order[]> {
    return this.orderRepo.find({
      relations: { items: true, user: true },
      order: { created_at: 'DESC' },
    });
  }

  async adminUpdateOrderStatus(
    orderId: string,
    dto: UpdateOrderStatusDto,
  ): Promise<Order> {
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
        return savedOrder;
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
    return this.orderRepo.save(order);
  }
}
