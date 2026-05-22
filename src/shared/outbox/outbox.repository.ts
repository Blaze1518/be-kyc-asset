// src/modules/outbox/infrastructure/outbox.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaRepository } from 'src/prisma/prisma.repository';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OutboxRepository extends PrismaRepository<'OutboxEvent'> {
  constructor(prisma: PrismaService) {
    super(prisma, 'outboxEvent');
  }
}
