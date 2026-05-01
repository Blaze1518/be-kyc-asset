// src/repositories/base/prisma.repository.ts
import { Prisma } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { handlePrismaError } from './prisma-error-handler';
import { IDatabaseContext } from 'src/common/database/interface/db-context.interface';

export type PrismaClientCustom = PrismaService | Prisma.TransactionClient;

export abstract class PrismaRepository<T extends Prisma.ModelName> {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly model: Uncapitalize<T>,
  ) {}

  protected getModel(ctx?: IDatabaseContext) {
    const client = ctx
      ? (ctx as unknown as Prisma.TransactionClient)
      : this.prisma;
    return client[this.model as keyof typeof client] as any;
  }

  async findMany(
    input?: Prisma.TypeMap['model'][T]['operations']['findMany']['args'],
    ctx?: IDatabaseContext,
  ): Promise<Prisma.TypeMap['model'][T]['operations']['findMany']['result']> {
    try {
      return await this.getModel(ctx).findMany(input);
    } catch (error) {
      return handlePrismaError(error, this.model);
    }
  }

  async findManyPaginated(
    query: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
    where?: Prisma.TypeMap['model'][T]['operations']['findMany']['args']['where'],
    ctx?: IDatabaseContext,
  ): Promise<
    [Prisma.TypeMap['model'][T]['operations']['findMany']['result'], number]
  > {
    try {
      const page = Number(query.page) || 1;
      const limit = Number(query.limit) || 10;
      const skip = (page - 1) * limit;
      const orderBy = query.sortBy
        ? { [query.sortBy]: query.sortOrder ?? 'asc' }
        : undefined;

      const model = this.getModel(ctx);
      const operations = [
        model.findMany({ where, skip, take: limit, orderBy }),
        model.count({ where }),
      ];
      return ctx
        ? ((await Promise.all(operations)) as [
            Prisma.TypeMap['model'][T]['operations']['findMany']['result'],
            number,
          ])
        : ((await this.prisma.$transaction(operations)) as [
            Prisma.TypeMap['model'][T]['operations']['findMany']['result'],
            number,
          ]);
    } catch (error) {
      return handlePrismaError(error, this.model);
    }
  }

  async findFirst(
    input?: Prisma.TypeMap['model'][T]['operations']['findFirst']['args'],
    ctx?: IDatabaseContext,
  ): Promise<Prisma.TypeMap['model'][T]['operations']['findFirst']['result']> {
    try {
      return await this.getModel(ctx).findFirst(input);
    } catch (error) {
      return handlePrismaError(error, this.model);
    }
  }

  async findUnique(
    input: Prisma.TypeMap['model'][T]['operations']['findUnique']['args'],
    ctx?: IDatabaseContext,
  ): Promise<Prisma.TypeMap['model'][T]['operations']['findUnique']['result']> {
    try {
      return await this.getModel(ctx).findUnique(input);
    } catch (error) {
      return handlePrismaError(error, this.model);
    }
  }

  async create(
    input: Prisma.TypeMap['model'][T]['operations']['create']['args'],
    ctx?: IDatabaseContext,
  ): Promise<Prisma.TypeMap['model'][T]['operations']['create']['result']> {
    try {
      return await this.getModel(ctx).create(input);
    } catch (error) {
      return handlePrismaError(error, this.model);
    }
  }

  async createMany(
    input: Prisma.TypeMap['model'][T]['operations']['createMany']['args'],
    ctx?: IDatabaseContext,
  ): Promise<Prisma.TypeMap['model'][T]['operations']['createMany']['result']> {
    try {
      return await this.getModel(ctx).createMany(input);
    } catch (error) {
      return handlePrismaError(error, this.model);
    }
  }

  async update(
    input: Prisma.TypeMap['model'][T]['operations']['update']['args'],
    ctx?: IDatabaseContext,
  ): Promise<Prisma.TypeMap['model'][T]['operations']['update']['result']> {
    try {
      return await this.getModel(ctx).update(input);
    } catch (error) {
      return handlePrismaError(error, this.model);
    }
  }

  async delete(
    input: Prisma.TypeMap['model'][T]['operations']['delete']['args'],
    ctx?: IDatabaseContext,
  ): Promise<Prisma.TypeMap['model'][T]['operations']['delete']['result']> {
    try {
      return await this.getModel(ctx).delete(input);
    } catch (error) {
      return handlePrismaError(error, this.model);
    }
  }

  async deleteMany(
    input?: Prisma.TypeMap['model'][T]['operations']['deleteMany']['args'],
    ctx?: IDatabaseContext,
  ): Promise<Prisma.TypeMap['model'][T]['operations']['deleteMany']['result']> {
    try {
      return await this.getModel(ctx).deleteMany(input);
    } catch (error) {
      return handlePrismaError(error, this.model);
    }
  }
}
