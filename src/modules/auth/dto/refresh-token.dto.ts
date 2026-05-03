import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    example: 'refresh-token-value',
    description: 'Refresh token đã được cấp khi đăng nhập hoặc refresh trước đó',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
