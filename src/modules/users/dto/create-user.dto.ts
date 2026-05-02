import {
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
  MaxLength,
  IsArray,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UserRoleIdDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'ID của vai trò được gán cho người dùng',
  })
  @IsUUID()
  @IsNotEmpty()
  id: string;
}

export class CreateUserDto {
  @ApiProperty({
    example: 'admin_pro',
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
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/)
  password: string;

  @ApiPropertyOptional({
    type: () => [UserRoleIdDto],
    description: 'Danh sách vai trò được gán cho người dùng',
    example: [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserRoleIdDto)
  roles?: UserRoleIdDto[];
}
