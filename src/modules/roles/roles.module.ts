import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { RolesRepository } from './repositories/roles.repository';
import { RolePermissionsRepository } from './repositories/role-permissions.repository';

@Module({
  controllers: [RolesController],
  providers: [RolesService, RolesRepository, RolePermissionsRepository],
})
export class RolesModule {}
