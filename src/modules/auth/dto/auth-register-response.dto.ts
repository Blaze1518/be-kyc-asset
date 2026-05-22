import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class RegisterUserResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'customer_01' })
  @Expose()
  username: string;

  @ApiProperty({ example: 'Nguyễn Văn A' })
  @Expose()
  displayName: string;
}

export class RegisterResponseDto {
  @ApiProperty({ example: 'Đăng ký tài khoản thành công.' })
  @Expose()
  message: string;

  @ApiProperty({ type: () => RegisterUserResponseDto })
  @Expose()
  @Type(() => RegisterUserResponseDto)
  user: RegisterUserResponseDto;
}
