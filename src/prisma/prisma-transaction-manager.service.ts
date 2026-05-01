import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TransactionManager } from 'src/common/database/abstract/transaction-manager.abstract';
import { IDatabaseContext } from 'src/common/database/interface/db-context.interface';

@Injectable()
export class PrismaTransactionManager implements TransactionManager {
  constructor(private prisma: PrismaService) {}

  run<T>(work: (ctx: IDatabaseContext) => Promise<T>): Promise<T> {
    return this.prisma.$transaction((tx) =>
      work(tx as unknown as IDatabaseContext),
    );
  }
}
