import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class AddToCartDto {
    @ApiProperty({ description: 'ID của sản phẩm' })
    @IsUUID()
    @IsNotEmpty()
    productId: string;

    @ApiProperty({ description: 'Số lượng mua', default: 1 })
    @IsInt()
    @Min(1)
    quantity: number;
}

export class UpdateCartItemDto {
    @ApiProperty({ description: 'Số lượng mua mới', default: 1 })
    @IsInt()
    @Min(1)
    quantity: number;
}

export class MergeCartDto {
    @ApiProperty({ description: 'Session ID của khách vãng lai cần gộp' })
    @IsString()
    @IsNotEmpty()
    guestSessionId: string;
}
