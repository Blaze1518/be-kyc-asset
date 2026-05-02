import { Injectable } from '@nestjs/common';
import { PrismaRepository } from 'src/prisma/prisma.repository';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RolePermissionsRepository extends PrismaRepository<'RolePermission'> {
  constructor(prisma: PrismaService) {
    super(prisma, 'rolePermission');
  }
}
