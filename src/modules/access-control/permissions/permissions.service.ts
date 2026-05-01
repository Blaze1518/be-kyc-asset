import { Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PermissionsRepository } from './repositories/permissions.repository';
import { PermissionConditionsRepository } from './repositories/permission-conditions.repository';
import { TransactionManager } from 'src/common/database/abstract/transaction-manager.abstract';

@Injectable()
export class PermissionsService {
  constructor(
    private readonly txManager: TransactionManager,
    private readonly permissionsRepository: PermissionsRepository,
    private readonly permissionConditionsRepository: PermissionConditionsRepository,
  ) {}

  async createPermission(data: CreatePermissionDto) {
    return await this.txManager.run(async (ctx) => {
      const permission = await this.permissionsRepository.create(
        {
          data: {
            name: data.name,
            description: data.description,
          },
        },
        ctx,
      );
      if (data.conditions && data.conditions.length > 0) {
        await this.permissionConditionsRepository.createMany(
          {
            data: data.conditions.map((cond) => ({
              permission_id: permission.id ?? '',
              attribute_id: cond.attribute_id,
              conditions: cond.logic,
            })),
          },
          ctx,
        );
      }
      return permission;
    });
  }

  findAll() {
    return `This action returns all permissions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} permission`;
  }

  update(id: number, updatePermissionDto: UpdatePermissionDto) {
    return `This action updates a #${id} permission`;
  }

  remove(id: number) {
    return `This action removes a #${id} permission`;
  }
}
