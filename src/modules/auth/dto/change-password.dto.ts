import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

const STRONG_PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/;

export class ChangePasswordDto {
  @ApiProperty({
    example: 'OldPassword@123',
    description: 'Mật khẩu hiện tại của người dùng',
  })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({
    example: 'NewPassword@123',
    description:
      'Mật khẩu mới, tối thiểu 8 ký tự, có chữ hoa, chữ thường, chữ số và ký tự đặc biệt',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(STRONG_PASSWORD_PATTERN)
  newPassword: string;

  @ApiProperty({
    example: 'NewPassword@123',
    description: 'Xác nhận lại mật khẩu mới',
  })
  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}
