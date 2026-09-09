import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';
import { Address } from './entities/address.entity';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepo: Repository<Address>,
  ) {}

  async create(userId: string, dto: CreateAddressDto): Promise<Address> {
    if (dto.isDefault) {
      await this.clearDefaultAddress(userId);
    } else {
      const existingCount = await this.addressRepo.count({ where: { userId } });
      if (existingCount === 0) {
        dto.isDefault = true;
      }
    }

    const addr = this.addressRepo.create({
      ...dto,
      userId,
    });
    return this.addressRepo.save(addr);
  }

  async findAllByUser(userId: string): Promise<Address[]> {
    return this.addressRepo.find({
      where: { userId },
      order: { isDefault: 'DESC', created_at: 'DESC' },
    });
  }

  async findOne(userId: string, id: string): Promise<Address> {
    const addr = await this.addressRepo.findOne({ where: { id, userId } });
    if (!addr) {
      throw new NotFoundException('Address not found');
    }
    return addr;
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateAddressDto,
  ): Promise<Address> {
    const addr = await this.findOne(userId, id);

    if (dto.isDefault && !addr.isDefault) {
      await this.clearDefaultAddress(userId);
    }

    Object.assign(addr, dto);
    return this.addressRepo.save(addr);
  }

  async remove(userId: string, id: string): Promise<void> {
    const addr = await this.findOne(userId, id);
    await this.addressRepo.remove(addr);
  }

  async setDefault(userId: string, id: string): Promise<Address> {
    await this.clearDefaultAddress(userId);
    const addr = await this.findOne(userId, id);
    addr.isDefault = true;
    return this.addressRepo.save(addr);
  }

  private async clearDefaultAddress(userId: string): Promise<void> {
    await this.addressRepo.update({ userId, isDefault: true }, { isDefault: false });
  }
}
