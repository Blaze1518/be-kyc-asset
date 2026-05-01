import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
export class CreateAttributeDto {
  /**
   * @description Tên định danh duy nhất của thuộc tính (slug).
   * @example "department_code"
   */
  @IsString({ message: 'Tên thuộc tính phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tên thuộc tính không được để trống' })
  @MaxLength(255, { message: 'Tên thuộc tính không quá 255 ký tự' })
  name: string;
}
