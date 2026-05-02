import { Injectable } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { IDatabaseContext } from 'src/common/database/interface/db-context.interface';
import { PrismaRepository } from 'src/prisma/prisma.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { handlePrismaError } from 'src/prisma/prisma-error-handler';

const roleWithRelationsInclude = {
  child_roles: true,
  permissions: {
    include: {
      permission: true,
    },
  },
} satisfies Prisma.RoleInclude;

export type RoleWithRelations = Prisma.RoleGetPayload<{
  include: typeof roleWithRelationsInclude;
}>;

@Injectable()
export class RolesRepository extends PrismaRepository<'Role'> {
  constructor(prisma: PrismaService) {
    super(prisma, 'role');
  }

  async findByIdWithPermissions(
    id: string,
    ctx?: IDatabaseContext,
  ): Promise<RoleWithRelations | null> {
    try {
      return await this.getModel(ctx).findUnique({
        where: { id },
        include: roleWithRelationsInclude,
      });
    } catch (error) {
      return handlePrismaError(error, 'role');
    }
  }

  async findManyPaginated(
    query: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
    where?: Prisma.RoleWhereInput,
    ctx?: IDatabaseContext,
  ): Promise<[RoleWithRelations[], number]> {
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
          include: roleWithRelationsInclude,
        }),
        model.count({ where }),
      ];

      return ctx
        ? (Promise.all(operations) as Promise<[RoleWithRelations[], number]>)
        : (this.prisma.$transaction(operations) as Promise<
            [RoleWithRelations[], number]
          >);
    } catch (error) {
      return handlePrismaError(error, 'role');
    }
  }
}
