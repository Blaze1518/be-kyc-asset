import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

const IP_OR_CIDR_PATTERN =
  /^((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.|$)){4}(\/([0-9]|[1-2][0-9]|3[0-2]))?$/;

export class CreateWhitelistIpDto {
  @ApiProperty({
    example: '192.168.1.10',
    description:
      'Địa chỉ IPv4 hoặc CIDR được phép truy cập, ví dụ 192.168.1.10 hoặc 10.0.0.0/24',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Matches(IP_OR_CIDR_PATTERN, {
    message: 'address phải là IPv4 hoặc CIDR hợp lệ',
  })
  address: string;

  @ApiPropertyOptional({
    example: 'IP văn phòng chính',
    description: 'Mô tả mục đích hoặc nguồn gốc của IP whitelist',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Trạng thái hoạt động của IP whitelist',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
