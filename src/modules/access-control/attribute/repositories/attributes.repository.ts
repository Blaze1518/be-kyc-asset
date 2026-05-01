import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaRepository } from 'src/prisma/prisma.repository';

@Injectable()
export class AttributesRepository extends PrismaRepository<'Attribute'> {
  constructor(prisma: PrismaService) {
    super(prisma, 'attribute');
  }
}
