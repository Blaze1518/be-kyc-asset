import { IsOptional, IsString, IsInt, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class QueryDto {
  /**
   * Tìm kiếm theo tên hoặc mô tả của điều kiện.
   * @example "department"
   */
  @IsOptional()
  @IsString()
  search?: string;

  /**
   * Số trang hiện tại.
   * @example 1
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  /**
   * Số lượng bản ghi trên mỗi trang.
   * @example 10
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  /**
   * Trường dữ liệu dùng để sắp xếp.
   * @example "name"
   */
  @IsOptional()
  @IsString()
  sortBy?: string;

  /**
   * Thứ tự sắp xếp.
   * @example asc
   */
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.ASC;
}
