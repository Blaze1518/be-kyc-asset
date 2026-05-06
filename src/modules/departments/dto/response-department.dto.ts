import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ResponseDepartmentDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'KYC_HCM' })
  @Expose()
  code: string;

  @ApiPropertyOptional({ example: 'Phòng KYC chi nhánh HCM' })
  @Expose()
  name?: string | null;

  @ApiProperty({ example: '2026-05-02T10:00:00.000Z' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ example: '2026-05-02T10:00:00.000Z' })
  @Expose()
  updatedAt: Date;
}
