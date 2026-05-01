import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNotEmpty,
  IsUUID,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PermissionConditionDto {
  @ApiProperty({
    description: 'Danh sách các điều kiện của quyền',
  })
  @IsUUID()
  @IsNotEmpty()
  attribute_id: string;

  /**
   * @description Điều kiện logic dưới dạng JSON object
   * @example { "eq": "IT", "in": ["IT", "HR"] }
   */
  @IsNotEmpty()
  @IsObject()
  logic: any;
}

export class CreatePermissionDto {
  /**
   * @description Tên định danh duy nhất của quyền
   * @example "view_user"
   */
  @IsString()
  @IsNotEmpty()
  name: string;

  /**
   * @description Mô tả chi tiết về quyền
   * @example "Cho phép xem thông tin người dùng"
   */
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: [
      {
        attribute_id: '550e8400-e29b-41d4-a716-446655440000',
        logic: { eq: 'admin' },
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PermissionConditionDto)
  conditions: PermissionConditionDto[];
}
