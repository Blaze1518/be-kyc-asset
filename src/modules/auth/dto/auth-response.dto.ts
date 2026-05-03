import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { UserRoleResponseDto } from 'src/modules/users/dto/response-user.dto';

export class AuthUserResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'admin_pro' })
  @Expose()
  username: string;

  @ApiProperty({ example: 'Nguyễn Văn A' })
  @Expose()
  displayName: string;

  @ApiProperty({ example: true })
  @Expose()
  isActive: boolean;

  @ApiProperty({ type: () => [UserRoleResponseDto] })
  @Expose()
  @Type(() => UserRoleResponseDto)
  roles: UserRoleResponseDto[];
}

export class AuthTokenResponseDto {
  @ApiProperty({ example: 900 })
  @Expose()
  expiresIn: number;

  @ApiProperty({ type: () => AuthUserResponseDto })
  @Expose()
  @Type(() => AuthUserResponseDto)
  user: AuthUserResponseDto;

  @ApiProperty({ example: 'Xác thực thành công' })
  @Expose()
  message: string;
}

export class AuthMessageResponseDto {
  @ApiProperty({ example: 'Thao tác thành công' })
  @Expose()
  message: string;
}
