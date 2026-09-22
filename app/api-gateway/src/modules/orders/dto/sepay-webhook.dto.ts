import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class SepayWebhookDto {
    @ApiProperty({ description: 'ID giao dịch trên SePAY' })
    @IsNumber()
    id: number;

    @ApiProperty({ description: 'Tên ngân hàng (MBBank, Vietcombank,...)' })
    @IsString()
    gateway: string;

    @ApiProperty({ description: 'Thời gian giao dịch' })
    @IsString()
    transactionDate: string;

    @ApiProperty({ description: 'Số tài khoản nhận' })
    @IsString()
    accountNumber: string;

    @ApiProperty({ description: 'Số tiền khách chuyển' })
    @IsNumber()
    transferAmount: number;

    @ApiProperty({ description: 'Loại giao dịch (in = tiền vào, out = tiền ra)' })
    @IsString()
    transferType: string;

    @ApiProperty({ description: 'Nội dung chuyển khoản (chứa mã đơn hàng)' })
    @IsString()
    content: string;

    @ApiProperty({ description: 'Mã tham chiếu ngân hàng' })
    @IsOptional()
    @IsString()
    referenceCode?: string;

    @ApiProperty({ description: 'Tài khoản phụ' })
    @IsOptional()
    @IsString()
    subAccount?: string;

    @ApiProperty({ description: 'Mã định danh giao dịch' })
    @IsOptional()
    @IsString()
    code?: string;

    @ApiProperty({ description: 'Mô tả chi tiết giao dịch' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ description: 'Số tiền tích lũy' })
    @IsOptional()
    @IsNumber()
    accumulated?: number;
}
