import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductStatus } from 'src/common/constants';
import { Product } from './entities/product.entity';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let service: ProductsService;
  const productRepo = {
    findAndCount: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getRepositoryToken(Product), useValue: productRepo },
      ],
    }).compile();

    service = module.get(ProductsService);
  });

  it('findAll returns paginated ACTIVE products', async () => {
    const product = { id: 'p1', status: ProductStatus.ACTIVE, name: 'Lavender' };
    productRepo.findAndCount.mockResolvedValue([[product], 1]);

    const result = await service.findAll({ page: 1, limit: 10 });

    expect(result.success).toBe(true);
    expect(result.data.data).toEqual([product]);
    expect(result.data.total).toBe(1);
    expect(productRepo.findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: ProductStatus.ACTIVE }),
        skip: 0,
        take: 10,
      }),
    );
  });

  it('findOne throws NotFoundException when missing', async () => {
    productRepo.findOne.mockResolvedValue(null);
    await expect(service.findOne('missing-id')).rejects.toThrow(
      NotFoundException,
    );
  });
});
