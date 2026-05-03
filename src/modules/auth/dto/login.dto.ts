import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'admin_pro',
    description: 'Tên đăng nhập của người dùng',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    example: 'Password@123',
    description: 'Mật khẩu đăng nhập',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({
    example: 'browser-device-id',
    description: 'ID thiết bị do client cung cấp nếu có',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  deviceId?: string;

  @ApiPropertyOptional({
    example: 'Chrome Windows',
    description: 'Tên thiết bị hiển thị trong danh sách phiên đăng nhập',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  deviceName?: string;
}
