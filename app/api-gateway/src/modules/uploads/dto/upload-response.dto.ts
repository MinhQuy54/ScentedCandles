import { ApiProperty } from '@nestjs/swagger';

export class StoredFileDto {
  @ApiProperty()
  key: string;

  @ApiProperty()
  url: string;

  @ApiProperty()
  size: number;

  @ApiProperty()
  mimeType: string;
}

export class UploadResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty()
  code: number;

  @ApiProperty({ type: StoredFileDto })
  data: StoredFileDto;
}
