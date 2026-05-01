import { PartialType } from '@nestjs/mapped-types';
import {
  CreatePermissionDto,
  PermissionConditionDto,
} from './create-permission.dto';

export class UpdatePermissionDto extends PartialType(CreatePermissionDto) {
  /**
   * @description Tên định danh duy nhất của quyền (optional khi update)
   * @example "edit_user"
   */
  name?: string;

  /**
   * @description Mô tả chi tiết về quyền (optional khi update)
   * @example "Cho phép chỉnh sửa thông tin người dùng"
   */
  description?: string;

  /**
   * @description Danh sách các điều kiện của quyền (optional khi update)
   * @example [{ "attribute_id": "uuid-2", "logic": { "contains": "manager" } }]
   */
  conditions?: PermissionConditionDto[];
}
