// src/repositories/base/prisma.repository.ts
import { Prisma } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { handlePrismaError } from './prisma-error-handler';

export abstract class PrismaRepository<T extends Prisma.ModelName> {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly model: Uncapitalize<T>,
  ) {}

  private get delegate() {
    return this.prisma[this.model as keyof PrismaService] as any;
  }

  async findMany(
    input?: Prisma.TypeMap['model'][T]['operations']['findMany']['args'],
  ): Promise<Prisma.TypeMap['model'][T]['operations']['findMany']['result']> {
    try {
      return await this.delegate.findMany(input);
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

      return await this.prisma.$transaction([
        this.delegate.findMany({ where, skip, take: limit, orderBy }),
        this.delegate.count({ where }),
      ]);
    } catch (error) {
      return handlePrismaError(error, this.model);
    }
  }

  async findFirst(
    input?: Prisma.TypeMap['model'][T]['operations']['findFirst']['args'],
  ): Promise<Prisma.TypeMap['model'][T]['operations']['findFirst']['result']> {
    try {
      return await this.delegate.findFirst(input);
    } catch (error) {
      return handlePrismaError(error, this.model);
    }
  }

  async findUnique(
    input: Prisma.TypeMap['model'][T]['operations']['findUnique']['args'],
  ): Promise<Prisma.TypeMap['model'][T]['operations']['findUnique']['result']> {
    try {
      return await this.delegate.findUnique(input);
    } catch (error) {
      return handlePrismaError(error, this.model);
    }
  }

  async create(
    input: Prisma.TypeMap['model'][T]['operations']['create']['args'],
  ): Promise<Prisma.TypeMap['model'][T]['operations']['create']['result']> {
    try {
      return await this.delegate.create(input);
    } catch (error) {
      return handlePrismaError(error, this.model);
    }
  }

  async update(
    input: Prisma.TypeMap['model'][T]['operations']['update']['args'],
  ): Promise<Prisma.TypeMap['model'][T]['operations']['update']['result']> {
    try {
      return await this.delegate.update(input);
    } catch (error) {
      return handlePrismaError(error, this.model);
    }
  }

  async delete(
    input: Prisma.TypeMap['model'][T]['operations']['delete']['args'],
  ): Promise<Prisma.TypeMap['model'][T]['operations']['delete']['result']> {
    try {
      return await this.delegate.delete(input);
    } catch (error) {
      return handlePrismaError(error, this.model);
    }
  }

  async deleteMany(
    input?: Prisma.TypeMap['model'][T]['operations']['deleteMany']['args'],
  ): Promise<Prisma.TypeMap['model'][T]['operations']['deleteMany']['result']> {
    try {
      return await this.delegate.deleteMany(input);
    } catch (error) {
      return handlePrismaError(error, this.model);
    }
  }
}
