import {
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateUserDto {
  /**
   * @description Họ và tên đầy đủ
   * @example "Nguyễn Văn A"
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  /**
   * Tên đăng nhập (chỉ chứa chữ, số và _)
   * @example "admin_pro"
   */
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @Matches(/^[a-zA-Z0-9_]+$/)
  username: string;

  /**
   * Mật khẩu (ít nhất 1 hoa, 1 thường, 1 số)
   * @example "Password@123"
   */
  @IsString()
  @MinLength(8)
  password: string;
}
