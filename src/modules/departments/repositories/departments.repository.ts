import { Injectable } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { IDatabaseContext } from 'src/common/database/interface/db-context.interface';
import { PrismaRepository } from 'src/prisma/prisma.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { handlePrismaError } from 'src/prisma/prisma-error-handler';

@Injectable()
export class DepartmentsRepository extends PrismaRepository<'Department'> {
  constructor(prisma: PrismaService) {
    super(prisma, 'department');
  }

  async findManyPaginated(
    query: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
    where?: Prisma.DepartmentWhereInput,
    ctx?: IDatabaseContext,
  ): Promise<[Prisma.DepartmentModel[], number]> {
    try {
      const page = Number(query.page) || 1;
      const limit = Number(query.limit) || 10;
      const skip = (page - 1) * limit;
      const orderBy = query.sortBy
        ? { [query.sortBy]: query.sortOrder ?? 'asc' }
        : { createdAt: 'desc' };

      const scopedWhere: Prisma.DepartmentWhereInput = {
        ...where,
        deletedAt: null,
      };

      const model = this.getModel(ctx);
      const operations = [
        model.findMany({
          where: scopedWhere,
          skip,
          take: limit,
          orderBy,
        }),
        model.count({ where: scopedWhere }),
      ];

      return ctx
        ? (Promise.all(operations) as Promise<
            [Prisma.DepartmentModel[], number]
          >)
        : (this.prisma.$transaction(operations) as Promise<
            [Prisma.DepartmentModel[], number]
          >);
    } catch (error) {
      return handlePrismaError(error, 'department');
    }
  }
}
