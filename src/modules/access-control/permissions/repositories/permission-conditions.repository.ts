import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaRepository } from 'src/prisma/prisma.repository';

@Injectable()
export class PermissionConditionsRepository extends PrismaRepository<'PermissionCondition'> {
  constructor(prisma: PrismaService) {
    super(prisma, 'permissionCondition');
  }
}
