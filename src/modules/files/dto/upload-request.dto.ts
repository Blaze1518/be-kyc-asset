import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadRequestDto {
  @ApiProperty({
    example: 'avatar.png',
    description: 'Tên gốc của file do người dùng tải lên',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fileName: string;

  @ApiProperty({
    example: 5242880,
    description:
      'Dung lượng tệp tính bằng byte (Ảnh tối đa 10MB, Video tối đa 500MB)',
  })
  @IsInt()
  @Min(1)
  fileSize: number;
}

export enum FileTypeEnum {
  IMAGE = 'image',
  VIDEO = 'video',
}
