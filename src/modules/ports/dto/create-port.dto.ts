import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Matches,
} from 'class-validator';

const PORT_CODE_PATTERN = /^[0-9]+$/;

export class CreatePortDto {
  @ApiProperty({
    example: '123456',
    description:
      'Mã cổng (Port Code) tương đương với mã nhân viên trên ATTPAY. Đảm bảo DUY NHẤT toàn hệ thống. Chỉ chấp nhận chữ số.',
    maxLength: 50,
  })
  @IsString({ message: 'Mã cổng phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Mã cổng không được để trống' })
  @MaxLength(50, { message: 'Mã cổng không quá 50 ký tự' })
  @Matches(PORT_CODE_PATTERN, {
    message: 'Mã cổng chỉ chấp nhận chữ số',
  })
  code: string;

  @ApiProperty({
    example: 'f8bet',
    description: 'Mã phòng ban (Site ATTPAY) mà cổng này trực thuộc.',
    maxLength: 100,
  })
  @IsString({ message: 'Mã phòng ban phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Mã phòng ban không được để trống' })
  codeDepartment: string;
}
