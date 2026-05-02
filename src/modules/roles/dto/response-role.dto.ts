import { Expose, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RoleResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'Manager' })
  @Expose()
  name: string;

  @ApiPropertyOptional({ example: 'Quản lý cấp trung trong hệ thống' })
  @Expose()
  description?: string | null;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440002',
    nullable: true,
  })
  @Expose()
  parent_role_id?: string | null;

  @ApiProperty({ example: '2026-05-02T10:00:00.000Z' })
  @Expose()
  createdAt: Date;

  @ApiPropertyOptional({ type: () => [RoleResponseDto] })
  @Expose()
  @Type(() => RoleResponseDto)
  child_roles?: RoleResponseDto[];
}
