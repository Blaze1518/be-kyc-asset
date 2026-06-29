import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'customer_001',
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
