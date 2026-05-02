import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { TransactionManager } from 'src/common/database/abstract/transaction-manager.abstract';
import {
  RolesRepository,
  RoleWithRelations,
} from './repositories/roles.repository';
import { RolePermissionsRepository } from './repositories/role-permissions.repository';
import { QueryDto } from 'src/common/dto/query.dto';
import { plainToInstance } from 'class-transformer';
import { RoleWithPermissionsDto } from './dto/role-permissions.dto';
import { IDatabaseContext } from 'src/common/database/interface/db-context.interface';

@Injectable()
export class RolesService {
  constructor(
    private readonly txManager: TransactionManager,
    private readonly rolesRepository: RolesRepository,
    private readonly rolePermissionsRepository: RolePermissionsRepository,
  ) {}

  private toResponse(role: RoleWithRelations): RoleWithPermissionsDto {
    return plainToInstance(
      RoleWithPermissionsDto,
      {
        ...role,
        permissions: role.permissions.map((rolePermission) => {
          return rolePermission.permission;
        }),
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }

  private async findRoleOrThrow(
    id: string,
    ctx?: IDatabaseContext,
  ): Promise<RoleWithRelations> {
    const role = await this.rolesRepository.findByIdWithPermissions(id, ctx);

    if (!role) {
      throw new NotFoundException(`Role với ID #${id} không tồn tại`);
    }

    return role;
  }

  async create(createRoleDto: CreateRoleDto) {
    return await this.txManager.run(async (ctx) => {
      const role = await this.rolesRepository.create(
        {
          data: {
            name: createRoleDto.name,
            description: createRoleDto.description,
            parent_role_id: createRoleDto.parent_role_id,
          },
        },
        ctx,
      );
      const roleId = role.id as string;

      if (createRoleDto.permissions && createRoleDto.permissions.length > 0) {
        await this.rolePermissionsRepository.createMany(
          {
            data: createRoleDto.permissions.map((permission) => ({
              role_id: roleId,
              permission_id: permission.id,
            })),
          },
          ctx,
        );
      }

      const createdRole = await this.findRoleOrThrow(roleId, ctx);
      return this.toResponse(createdRole);
    });
  }

  async findAll(query: QueryDto) {
    const { search, page = 1, limit = 10, ...paginationParams } = query;
    let where = {};
    if (search) {
      where = {
        OR: [{ name: { contains: search, mode: 'insensitive' } }],
      };
    }

    const [items, total] = await this.rolesRepository.findManyPaginated(
      { page, limit, ...paginationParams },
      where,
    );

    return {
      items: items.map((item) => this.toResponse(item)),
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const role = await this.findRoleOrThrow(id);
    return this.toResponse(role);
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    return await this.txManager.run(async (ctx) => {
      await this.rolesRepository.update(
        {
          where: { id },
          data: {
            name: updateRoleDto.name,
            description: updateRoleDto.description,
            parent_role_id: updateRoleDto.parent_role_id,
          },
        },
        ctx,
      );

      if (updateRoleDto.permissions !== undefined) {
        await this.rolePermissionsRepository.deleteMany(
          {
            where: { role_id: id },
          },
          ctx,
        );

        if (updateRoleDto.permissions.length > 0) {
          await this.rolePermissionsRepository.createMany(
            {
              data: updateRoleDto.permissions.map((permission) => ({
                role_id: id,
                permission_id: permission.id,
              })),
            },
            ctx,
          );
        }
      }

      const updatedRole = await this.findRoleOrThrow(id, ctx);
      return this.toResponse(updatedRole);
    });
  }

  async remove(id: string) {
    return await this.txManager.run(async (ctx) => {
      const existingRole = await this.findRoleOrThrow(id, ctx);

      await this.rolesRepository.delete(
        {
          where: { id },
        },
        ctx,
      );

      return this.toResponse(existingRole);
    });
  }
}
