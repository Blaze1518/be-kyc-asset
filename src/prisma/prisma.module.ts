// src/prisma/prisma.module.ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaTransactionManager } from './prisma-transaction-manager.service';
import { TransactionManager } from 'src/common/database/abstract/transaction-manager.abstract';

@Global()
@Module({
  providers: [
    PrismaService,
    PrismaTransactionManager,
    {
      provide: TransactionManager,
      useExisting: PrismaTransactionManager,
    },
  ],
  exports: [PrismaService, PrismaTransactionManager, TransactionManager],
})
export class PrismaModule {}
