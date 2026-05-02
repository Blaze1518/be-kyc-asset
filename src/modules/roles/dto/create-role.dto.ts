import {
  IsString,
  IsOptional,
  IsUUID,
  MaxLength,
  IsArray,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class PermissionIdDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'ID của quyền được gán cho vai trò',
  })
  @IsUUID()
  @IsNotEmpty()
  id: string;
}

export class CreateRoleDto {
  @ApiProperty({ example: 'Manager', description: 'Tên duy nhất của vai trò' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ example: 'Quản lý cấp trung trong hệ thống' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID của vai trò cha (nếu có)',
  })
  @IsOptional()
  @IsUUID()
  parent_role_id?: string;

  @ApiPropertyOptional({
    type: () => [PermissionIdDto],
    description: 'Danh sách các ID quyền hạn gán trực tiếp cho vai trò',
    example: [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PermissionIdDto)
  permissions?: PermissionIdDto[];
}
