import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ResponseWhitelistIpDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @Expose()
  id: string;

  @ApiProperty({ example: '192.168.1.10' })
  @Expose()
  address: string;

  @ApiPropertyOptional({ example: 'IP văn phòng chính' })
  @Expose()
  description?: string | null;

  @ApiProperty({ example: true })
  @Expose()
  isActive: boolean;

  @ApiProperty({ example: '2026-05-02T10:00:00.000Z' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ example: '2026-05-02T10:00:00.000Z' })
  @Expose()
  updatedAt: Date;
}
