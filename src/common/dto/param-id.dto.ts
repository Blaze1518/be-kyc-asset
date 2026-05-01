import { IsUUID } from 'class-validator';

export class ParamsWithIdDto {
  /**
   * ID của điều kiện quyền (định dạng UUID)
   * @example "550e8400-e29b-41d4-a716-446655440000"
   */
  @IsUUID('all', { message: 'ID phải là định dạng UUID hợp lệ' })
  id: string;
}
