import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserRoleIdDto } from './create-user.dto';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'Nguyễn Văn B',
    description: 'Tên hiển thị mới của người dùng',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  displayName?: string;

  @ApiPropertyOptional({
    example: 'NewPassword@123',
    description:
      'Mật khẩu mới. Khi cập nhật password, hệ thống sẽ tăng token_version để làm nền revoke token.',
    minLength: 8,
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/)
  password?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Trạng thái hoạt động của người dùng',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    type: () => [UserRoleIdDto],
    description:
      'Danh sách vai trò mới. Bỏ qua field này để giữ nguyên; gửi mảng rỗng để xóa toàn bộ vai trò.',
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
