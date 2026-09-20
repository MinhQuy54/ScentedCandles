import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ChatRequestDto {
  @ApiProperty({ example: 'Chính sách đổi trả như thế nào?' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  message: string;
}
