import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateInventoryDto {
  @IsInt()
  @Min(0)
  quantityOnHand: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  lowStockThreshold?: number;

  @IsOptional()
  @IsString()
  note?: string;
}

export class AdjustInventoryDto {
  @IsInt()
  quantityChange: number;

  @IsOptional()
  @IsString()
  note?: string;
}
