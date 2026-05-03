import { Injectable } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { IDatabaseContext } from 'src/common/database/interface/db-context.interface';
import { PrismaRepository } from 'src/prisma/prisma.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { handlePrismaError } from 'src/prisma/prisma-error-handler';

export type RefreshTokenWithUser = Prisma.RefreshTokenGetPayload<{
  include: { user: true };
}>;

@Injectable()
export class RefreshTokensRepository extends PrismaRepository<'RefreshToken'> {
  constructor(prisma: PrismaService) {
    super(prisma, 'refreshToken');
  }

  async findByHash(
    tokenHash: string,
    ctx?: IDatabaseContext,
  ): Promise<RefreshTokenWithUser | null> {
    try {
      return await this.getModel(ctx).findFirst({
        where: { token_hash: tokenHash },
        include: { user: true },
      });
    } catch (error) {
      return handlePrismaError(error, 'refreshToken');
    }
  }

  async findValidByHash(
    tokenHash: string,
    ctx?: IDatabaseContext,
  ): Promise<RefreshTokenWithUser | null> {
    try {
      return await this.getModel(ctx).findFirst({
        where: {
          token_hash: tokenHash,
          is_revoked: false,
          used_at: null,
          expires_at: { gt: new Date() },
        },
        include: { user: true },
      });
    } catch (error) {
      return handlePrismaError(error, 'refreshToken');
    }
  }

  async revokeByHash(tokenHash: string, ctx?: IDatabaseContext) {
    try {
      return await this.getModel(ctx).updateMany({
        where: { token_hash: tokenHash },
        data: {
          is_revoked: true,
          used_at: new Date(),
        },
      });
    } catch (error) {
      return handlePrismaError(error, 'refreshToken');
    }
  }

  async revokeFamily(tokenFamily: string, ctx?: IDatabaseContext) {
    try {
      return await this.getModel(ctx).updateMany({
        where: { token_family: tokenFamily },
        data: {
          is_revoked: true,
          used_at: new Date(),
        },
      });
    } catch (error) {
      return handlePrismaError(error, 'refreshToken');
    }
  }

  async revokeAllForUser(userId: string, ctx?: IDatabaseContext) {
    try {
      return await this.getModel(ctx).updateMany({
        where: { user_id: userId },
        data: {
          is_revoked: true,
          used_at: new Date(),
        },
      });
    } catch (error) {
      return handlePrismaError(error, 'refreshToken');
    }
  }
}
