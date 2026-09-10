import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';
import { Address } from './entities/address.entity';
import { ResponseCommon } from 'src/common/dto/response.dto';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepo: Repository<Address>,
  ) {}

  async create(userId: string, dto: CreateAddressDto): Promise<ResponseCommon<Address>> {
    if (dto.isDefault) {
      await this.clearDefaultAddress(userId);
    } else {
      const existingCount = await this.addressRepo.count({ where: { userId } });
      if (existingCount === 0) {
        dto.isDefault = true;
      }
    }

    const addr = this.addressRepo.create({ ...dto, userId });
    const data = await this.addressRepo.save(addr);
    return ResponseCommon.created(data, 'ADDRESS_CREATED');
  }

  async findAllByUser(userId: string): Promise<ResponseCommon<Address[]>> {
    const data = await this.addressRepo.find({
      where: { userId },
      order: { isDefault: 'DESC', created_at: 'DESC' },
    });
    return ResponseCommon.ok(data, 'OK');
  }

  async findOne(userId: string, id: string): Promise<ResponseCommon<Address>> {
    const addr = await this.addressRepo.findOne({ where: { id, userId } });
    if (!addr) {
      throw new NotFoundException('Address not found');
    }
    return ResponseCommon.ok(addr, 'OK');
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateAddressDto,
  ): Promise<ResponseCommon<Address>> {
    const { data: addr } = await this.findOne(userId, id);

    if (dto.isDefault && !addr.isDefault) {
      await this.clearDefaultAddress(userId);
    }

    Object.assign(addr, dto);
    const data = await this.addressRepo.save(addr);
    return ResponseCommon.ok(data, 'ADDRESS_UPDATED');
  }

  async remove(userId: string, id: string): Promise<ResponseCommon<null>> {
    const { data: addr } = await this.findOne(userId, id);
    await this.addressRepo.remove(addr);
    return ResponseCommon.ok(null, 'ADDRESS_DELETED');
  }

  async setDefault(userId: string, id: string): Promise<ResponseCommon<Address>> {
    await this.clearDefaultAddress(userId);
    const { data: addr } = await this.findOne(userId, id);
    addr.isDefault = true;
    const data = await this.addressRepo.save(addr);
    return ResponseCommon.ok(data, 'ADDRESS_DEFAULT_SET');
  }

  private async clearDefaultAddress(userId: string): Promise<void> {
    await this.addressRepo.update({ userId, isDefault: true }, { isDefault: false });
  }
}
