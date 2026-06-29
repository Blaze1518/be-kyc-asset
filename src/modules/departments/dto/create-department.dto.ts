import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Matches,
} from 'class-validator';

// Pattern cho phép chữ cái (cả hoa và thường), số, dấu gạch dưới và gạch ngang
const DEPARTMENT_CODE_PATTERN = /^[A-Za-z0-9_-]+$/;

export class CreateDepartmentDto {
  @ApiProperty({
    example: 'f8bet',
    description:
      'Mã định danh duy nhất của phòng ban (Site trong hệ thống ATTPAY). Chỉ chấp nhận chữ cái, số, dấu gạch dưới và gạch ngang.',
    maxLength: 100,
  })
  @IsString({ message: 'Mã phòng ban phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Mã phòng ban không được để trống' })
  @MaxLength(100, { message: 'Mã phòng ban không quá 100 ký tự' })
  @Matches(DEPARTMENT_CODE_PATTERN, {
    message:
      'Mã phòng ban chỉ chấp nhận chữ cái, số, dấu gạch dưới và gạch ngang',
  })
  code: string;

  @ApiPropertyOptional({
    example: 'Giải trí F8BET',
    description: 'Tên đầy đủ hoặc mô tả của phòng ban / site',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'Tên phòng ban phải là chuỗi ký tự' })
  @MaxLength(255, { message: 'Tên phòng ban không quá 255 ký tự' })
  name?: string;
}
