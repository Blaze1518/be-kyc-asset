import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class UserRoleResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'Admin' })
  @Expose()
  name: string;

  @ApiPropertyOptional({ example: 'Quản trị viên hệ thống' })
  @Expose()
  description?: string | null;
}

export class ResponseUserDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'admin_pro' })
  @Expose()
  username: string;

  @ApiProperty({ example: 'Nguyễn Văn A' })
  @Expose()
  displayName: string;

  @ApiProperty({ example: true })
  @Expose()
  isActive: boolean;

  @ApiProperty({ example: '2026-05-02T10:00:00.000Z' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ example: '2026-05-02T10:00:00.000Z' })
  @Expose()
  updatedAt: Date;

  @ApiProperty({ example: 1 })
  @Expose()
  tokenVersion: number;

  @ApiPropertyOptional({
    example: null,
    nullable: true,
  })
  @Expose()
  deletedAt?: Date | null;

  @ApiProperty({ type: () => [UserRoleResponseDto] })
  @Expose()
  @Type(() => UserRoleResponseDto)
  roles: UserRoleResponseDto[];
}
