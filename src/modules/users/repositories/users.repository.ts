import { Injectable } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { IDatabaseContext } from 'src/common/database/interface/db-context.interface';
import { PrismaRepository } from 'src/prisma/prisma.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { handlePrismaError } from 'src/prisma/prisma-error-handler';

const userWithRolesInclude = {
  roles: {
    include: {
      role: true,
    },
  },
} satisfies Prisma.UserInclude;

export type UserWithRoles = Prisma.UserGetPayload<{
  include: typeof userWithRolesInclude;
}>;

@Injectable()
export class UsersRepository extends PrismaRepository<'User'> {
  constructor(prisma: PrismaService) {
    super(prisma, 'user');
  }

  async findByIdWithRoles(
    id: string,
    ctx?: IDatabaseContext,
  ): Promise<UserWithRoles | null> {
    try {
      return await this.getModel(ctx).findFirst({
        where: {
          id,
          deletedAt: null,
        },
        include: userWithRolesInclude,
      });
    } catch (error) {
      return handlePrismaError(error, 'user');
    }
  }

  async findManyPaginated(
    query: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
    where?: Prisma.UserWhereInput,
    ctx?: IDatabaseContext,
  ): Promise<[UserWithRoles[], number]> {
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
          include: userWithRolesInclude,
        }),
        model.count({ where }),
      ];

      return ctx
        ? (Promise.all(operations) as Promise<[UserWithRoles[], number]>)
        : (this.prisma.$transaction(operations) as Promise<
            [UserWithRoles[], number]
          >);
    } catch (error) {
      return handlePrismaError(error, 'user');
    }
  }
}
