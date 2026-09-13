import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InventoryTransactionType } from 'src/common/constants';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { AdjustInventoryDto, UpdateInventoryDto } from './dto/inventory.dto';
import { InventoryTransaction } from './entities/inventory-transaction.entity';
import { Inventory } from './entities/inventory.entity';

import { Product } from '../products/entities/product.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,
    @InjectRepository(InventoryTransaction)
    private readonly transactionRepo: Repository<InventoryTransaction>,
    private readonly dataSource: DataSource,
  ) { }

  async getAllInventory(): Promise<Inventory[]> {
    const products = await this.dataSource.getRepository(Product).find();
    const existingInventories = await this.inventoryRepo.find({
      relations: { product: true },
    });

    const existingProductIds = new Set(existingInventories.map((inv) => inv.productId));

    const missingProducts = products.filter((p) => !existingProductIds.has(p.id));

    if (missingProducts.length > 0) {
      const newInventories = missingProducts.map((p) =>
        this.inventoryRepo.create({
          productId: p.id,
          quantityOnHand: 0,
          quantityReserved: 0,
          lowStockThreshold: 5,
        }),
      );
      await this.inventoryRepo.save(newInventories);
    }

    return this.inventoryRepo.find({
      relations: { product: true },
      order: { product: { name: 'ASC' } },
    });
  }

  async getInventory(productId: string): Promise<Inventory> {
    const inv = await this.inventoryRepo.findOne({
      where: { productId },
      relations: { product: true },
    });
    if (!inv) {
      throw new NotFoundException(`Inventory for product ${productId} not found`);
    }
    return inv;
  }

  async getTransactions(productId: string): Promise<InventoryTransaction[]> {
    const inv = await this.getInventory(productId);
    return this.transactionRepo.find({
      where: { inventoryId: inv.id },
      order: { createdAt: 'DESC' },
    });
  }



  async setStock(
    productId: string, dto: UpdateInventoryDto, userId?: string
  ): Promise<Inventory> {
    return this.dataSource.transaction(async (manager) => {
      let inv = await manager.findOne(Inventory, {
        where: { productId }
      })

      if (!inv) {
        inv = manager.create(Inventory, {
          productId: productId,
          quantityOnHand: dto.quantityOnHand,
          lowStockThreshold: dto.lowStockThreshold ?? 5
        })
      } else {
        const change = dto.quantityOnHand - inv.quantityOnHand;
        inv.quantityOnHand = dto.quantityOnHand;
        if (dto.lowStockThreshold !== undefined) {
          inv.lowStockThreshold = dto.lowStockThreshold;
        }

        const tx = manager.create(InventoryTransaction, {
          inventoryId: inv.id,
          quantityChange: change,
          quantityAfter: inv.quantityOnHand,
          referenceType: "MANUAL",
          note: dto.note || 'Manual set stock',
          createdBy: userId
        })

        await manager.save(tx);
      }

      return manager.save(inv);
    })
  }


  async adjustStock(
    productId: string,
    dto: AdjustInventoryDto,
    userId?: string,
  ): Promise<Inventory> {
    return this.dataSource.transaction(async (manager) => {
      const inv = await manager.findOne(Inventory, {
        where: { productId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!inv) {
        throw new NotFoundException(`Inventory for product ${productId} not found`);
      }

      const newQty = inv.quantityOnHand + dto.quantityChange;
      if (newQty < 0) {
        throw new BadRequestException('Stock cannot be negative');
      }

      inv.quantityOnHand = newQty;
      await manager.save(inv);

      const tx = manager.create(InventoryTransaction, {
        inventoryId: inv.id,
        type: InventoryTransactionType.ADJUSTMENT,
        quantityChange: dto.quantityChange,
        quantityAfter: inv.quantityOnHand,
        referenceType: 'MANUAL',
        note: dto.note || 'Manual adjust stock',
        createdBy: userId,
      });
      await manager.save(tx);

      return inv;
    });
  }

  /**
   * Bước 1: Giữ chỗ (Reserve) khi khách hàng vừa bấm Đặt hàng (Order PENDING)
   * Tăng quantityReserved, giữ nguyên quantityOnHand.
   */
  async reserveStockInTx(
    queryRunner: QueryRunner,
    productId: string,
    quantity: number,
    referenceId: string,
    userId?: string,
  ): Promise<Inventory> {
    const inv = await queryRunner.manager.findOne(Inventory, {
      where: { productId },
      lock: { mode: 'pessimistic_write' },
    });

    if (!inv) {
      throw new NotFoundException(`Inventory for product ${productId} not found`);
    }

    const available = inv.quantityOnHand - inv.quantityReserved;
    if (available < quantity) {
      throw new BadRequestException(
        `Insufficient stock for product ${productId}. Available: ${available}, requested: ${quantity}`,
      );
    }

    inv.quantityReserved += quantity;
    await queryRunner.manager.save(inv);

    const tx = queryRunner.manager.create(InventoryTransaction, {
      inventoryId: inv.id,
      type: InventoryTransactionType.RESERVE,
      quantityChange: quantity,
      quantityAfter: inv.quantityOnHand - inv.quantityReserved,
      referenceType: 'ORDER',
      referenceId,
      note: `Reserve for order ${referenceId}`,
      createdBy: userId,
    });
    await queryRunner.manager.save(tx);

    return inv;
  }

  /**
   * Bước 2: Nhân viên xác nhận/lên đơn (Order PROCESSING/SHIPPED)
   * Giảm quantityOnHand và giảm quantityReserved tương ứng.
   */
  async commitStockInTx(
    queryRunner: QueryRunner,
    productId: string,
    quantity: number,
    referenceId: string,
    userId?: string,
  ): Promise<Inventory> {
    const inv = await queryRunner.manager.findOne(Inventory, {
      where: { productId },
      lock: { mode: 'pessimistic_write' },
    });

    if (!inv) {
      throw new NotFoundException(`Inventory for product ${productId} not found`);
    }

    inv.quantityOnHand = Math.max(0, inv.quantityOnHand - quantity);
    inv.quantityReserved = Math.max(0, inv.quantityReserved - quantity);
    await queryRunner.manager.save(inv);

    const tx = queryRunner.manager.create(InventoryTransaction, {
      inventoryId: inv.id,
      type: InventoryTransactionType.ORDER,
      quantityChange: -quantity,
      quantityAfter: inv.quantityOnHand,
      referenceType: 'ORDER',
      referenceId,
      note: `Staff confirmed order ${referenceId}`,
      createdBy: userId,
    });
    await queryRunner.manager.save(tx);

    return inv;
  }

  /**
   * Bước 3: Hủy đơn hàng (Order CANCELLED)
   * Nếu chưa xuất kho: Giảm quantityReserved.
   * Nếu đã xuất kho trước đó: Cộng trả lại quantityOnHand.
   */
  async releaseStockInTx(
    queryRunner: QueryRunner,
    productId: string,
    quantity: number,
    referenceId: string,
    isAlreadyCommitted: boolean,
    userId?: string,
  ): Promise<Inventory> {
    const inv = await queryRunner.manager.findOne(Inventory, {
      where: { productId },
      lock: { mode: 'pessimistic_write' },
    });

    if (!inv) {
      throw new NotFoundException(`Inventory for product ${productId} not found`);
    }

    if (isAlreadyCommitted) {
      // Đã xuất kho thực tế -> Nhập lại kho
      inv.quantityOnHand += quantity;
    } else {
      // Mới giữ chỗ -> Hủy giữ chỗ
      inv.quantityReserved = Math.max(0, inv.quantityReserved - quantity);
    }
    await queryRunner.manager.save(inv);

    const tx = queryRunner.manager.create(InventoryTransaction, {
      inventoryId: inv.id,
      type: isAlreadyCommitted ? InventoryTransactionType.RETURN : InventoryTransactionType.RELEASE,
      quantityChange: isAlreadyCommitted ? quantity : 0,
      quantityAfter: inv.quantityOnHand,
      referenceType: 'ORDER',
      referenceId,
      note: isAlreadyCommitted
        ? `Refund to stock for cancelled order ${referenceId}`
        : `Release reservation for cancelled order ${referenceId}`,
      createdBy: userId,
    });
    await queryRunner.manager.save(tx);

    return inv;
  }
}


