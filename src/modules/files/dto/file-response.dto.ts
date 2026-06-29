import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class UploadUrlResponseDto {
  @ApiProperty({
    example:
      'http://localhost:8333/attpay-media/f8bet/123456/avatar_20260628_a7x9.png?X-Amz-Signature=...',
    description:
      'Đường dẫn Pre-signed URL dùng để thực hiện HTTP PUT đẩy file thẳng lên SeaweedFS',
  })
  @Expose()
  uploadUrl: string;

  @ApiProperty({
    example:
      'http://localhost:8333/attpay-media/f8bet/123456/avatar_20260628_a7x9.png',
    description: 'Đường dẫn tĩnh public truy cập trực tiếp file sau này',
  })
  @Expose()
  fileUrl: string;

  @ApiProperty({
    example: 'avatar_20260628120000_a7x9.png',
    description: 'Tên file mới hệ thống tự sinh để chống trùng lặp',
  })
  @Expose()
  fileName: string;
}

export class FileResponseDto {
  @ApiProperty({
    example: 'image_20260425153012_a7x9.jpg',
    description: 'Tên tệp tin',
  })
  @Expose()
  fileName: string;

  @ApiProperty({ example: 1048576, description: 'Dung lượng tệp (bytes)' })
  @Expose()
  fileSize: number;

  @ApiProperty({
    example: '2026-06-28T12:25:58.000Z',
    description: 'Thời gian cập nhật cuối cùng',
  })
  @Expose()
  lastModified: Date;

  @ApiProperty({
    example:
      'http://localhost:8333/attpay-media/f8bet/123456/image_20260425153012_a7x9.jpg',
    description: 'Đường dẫn trực tiếp xem file',
  })
  @Expose()
  url: string;
}
