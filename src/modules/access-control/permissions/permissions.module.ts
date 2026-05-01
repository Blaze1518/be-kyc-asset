import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { PermissionsRepository } from './repositories/permissions.repository';
import { PermissionConditionsRepository } from './repositories/permission-conditions.repository';

@Module({
  controllers: [PermissionsController],
  providers: [
    PermissionsService,
    PermissionsRepository,
    PermissionConditionsRepository,
  ],
})
export class PermissionsModule {}
