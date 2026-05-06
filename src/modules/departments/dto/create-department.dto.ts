import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Matches,
} from 'class-validator';

const DEPARTMENT_CODE_PATTERN = /^[A-Za-z0-9_-]+$/;

export class CreateDepartmentDto {
  @ApiProperty({
    example: 'KYC_HCM',
    description:
      'Mã định danh duy nhất của đơn vị. Chỉ chấp nhận chữ cái, số, dấu gạch dưới và gạch ngang.',
    maxLength: 100,
  })
  @IsString({ message: 'Mã đơn vị phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Mã đơn vị không được để trống' })
  @MaxLength(100, { message: 'Mã đơn vị không quá 100 ký tự' })
  @Matches(DEPARTMENT_CODE_PATTERN, {
    message: 'Mã đơn vị chỉ chấp nhận chữ cái, số, dấu gạch dưới và gạch ngang',
  })
  code: string;

  @ApiPropertyOptional({
    example: 'Phòng KYC chi nhánh HCM',
    description: 'Tên đầy đủ của đơn vị',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'Tên đơn vị phải là chuỗi ký tự' })
  @MaxLength(255, { message: 'Tên đơn vị không quá 255 ký tự' })
  name?: string;
}
