import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

const STRONG_PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/;

export class RegisterDto {
  @ApiProperty({
    example: 'customer_001',
    description: 'Tên đăng nhập duy nhất, chỉ chứa chữ, số và dấu gạch dưới',
    minLength: 5,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(255)
  @Matches(/^[a-zA-Z0-9_]+$/)
  username: string;

  @ApiProperty({
    example: 'Nguyễn Văn A',
    description: 'Tên hiển thị của người dùng',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  displayName: string;

  @ApiProperty({
    example: 'Password@123',
    description:
      'Mật khẩu tối thiểu 8 ký tự, có chữ hoa, chữ thường, chữ số và ký tự đặc biệt',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(STRONG_PASSWORD_PATTERN)
  password: string;
}
