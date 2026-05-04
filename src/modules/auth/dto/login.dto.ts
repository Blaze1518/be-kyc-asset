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
}
