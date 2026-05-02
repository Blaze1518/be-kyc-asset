import { Expose, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RoleResponseDto } from './response-role.dto';

export class PermissionDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'view_user' })
  @Expose()
  name: string;

  @ApiPropertyOptional({ example: 'Cho phép xem thông tin người dùng' })
  @Expose()
  description?: string | null;
}

export class RoleWithPermissionsDto extends RoleResponseDto {
  @ApiProperty({ type: () => [PermissionDto] })
  @Expose()
  @Type(() => PermissionDto)
  permissions: PermissionDto[];
}
