import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaRepository } from 'src/prisma/prisma.repository';
import { IDatabaseContext } from 'src/common/database/interface/db-context.interface';
import { Prisma } from 'src/generated/prisma/client';
import { handlePrismaError } from 'src/prisma/prisma-error-handler';

@Injectable()
export class PermissionsRepository extends PrismaRepository<'Permission'> {
  constructor(prisma: PrismaService) {
    super(prisma, 'permission');
  }

  async findManyPaginated(
    query: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
    where?: Prisma.PermissionWhereInput,
    ctx?: IDatabaseContext,
  ): Promise<
    [
      Prisma.PermissionGetPayload<{
        include: { conditions: { include: { attribute: true } } };
      }>[],
      number,
    ]
  > {
    try {
      const page = Number(query.page) || 1;
      const limit = Number(query.limit) || 10;
      const skip = (page - 1) * limit;
      const orderBy = query.sortBy
        ? { [query.sortBy]: query.sortOrder ?? 'asc' }
        : { createdAt: 'desc' };

      const model = this.getModel(ctx);

      const operations = [
        model.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          include: {
            conditions: {
              include: { attribute: true },
            },
          },
        }),
        model.count({ where }),
      ];

      return ctx
        ? (Promise.all(operations) as any)
        : (this.prisma.$transaction(operations) as any);
    } catch (error) {
      return handlePrismaError(error, 'permission');
    }
  }
}
