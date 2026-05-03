import { Injectable } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { IDatabaseContext } from 'src/common/database/interface/db-context.interface';
import { PrismaRepository } from 'src/prisma/prisma.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { handlePrismaError } from 'src/prisma/prisma-error-handler';

export const userWithRolesInclude = {
  roles: {
    include: {
      role: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
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
          isActive: true,
        },
        include: userWithRolesInclude,
      });
    } catch (error) {
      return handlePrismaError(error, 'user');
    }
  }

  async findUniqueWithRoles(
    id: string,
    ctx?: IDatabaseContext,
  ): Promise<UserWithRoles | null> {
    try {
      return await this.getModel(ctx).findUnique({
        where: { id },
        include: userWithRolesInclude,
      });
    } catch (error) {
      return handlePrismaError(error, 'user');
    }
  }

  async findByUsernameWithRoles(
    username: string,
    ctx?: IDatabaseContext,
  ): Promise<UserWithRoles | null> {
    try {
      return await this.getModel(ctx).findFirst({
        where: {
          username,
          isActive: true,
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
          where: { ...where, deletedAt: null },
          skip,
          take: limit,
          orderBy,
          include: userWithRolesInclude,
        }),
        model.count({ where: { ...where, deletedAt: null } }),
      ];

      const [users, count] = ctx
        ? await Promise.all(operations)
        : await this.prisma.$transaction(operations);

      return [users, count];
    } catch (error) {
      return handlePrismaError(error, 'user');
    }
  }
}
