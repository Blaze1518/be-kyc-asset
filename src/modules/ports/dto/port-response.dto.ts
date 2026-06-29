import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

class DepartmentInPortDto {
  @ApiProperty({ example: 'f8bet' })
  @Expose()
  code: string;

  @ApiProperty({ example: 'Giải trí F8BET' })
  @Expose()
  name: string;
}

export class PortResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440002',
    description: 'ID hệ thống (UUID)',
  })
  @Expose()
  id: string;

  @ApiProperty({ example: '123456', description: 'Mã cổng / Mã nhân viên' })
  @Expose()
  code: string;

  @ApiPropertyOptional({ example: 'Nguyễn Văn A' })
  @Expose()
  name?: string;

  @ApiProperty({
    type: () => DepartmentInPortDto,
    description: 'Thông tin phòng ban trực thuộc',
  })
  @Expose()
  @Type(() => DepartmentInPortDto)
  department: DepartmentInPortDto;

  @ApiProperty({ example: '2026-06-28T12:00:00.000Z' })
  @Expose()
  createdAt: Date;
}
