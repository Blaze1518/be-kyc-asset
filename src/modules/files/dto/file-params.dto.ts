import { IsString, IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DepartmentPortParamsDto {
  @ApiProperty({
    example: 'f8bet',
    description: 'Site trong hệ thống ATTPAY',
  })
  @IsString()
  @IsNotEmpty()
  departmentCode: string;

  @ApiProperty({
    example: '123456',
    description: 'Mã số cổng (Port Code) duy nhất của nhân viên',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]+$/, { message: 'Mã cổng chỉ được phép chứa số' })
  portCode: string;
}

export class FileRouteParamsDto extends DepartmentPortParamsDto {
  @ApiProperty({
    example: 'image_20260425153012_a7x9.jpg',
    description: 'Tên đầy đủ của tệp tin bao gồm cả đuôi mở rộng',
  })
  @IsString()
  @IsNotEmpty()
  fileName: string;
}
