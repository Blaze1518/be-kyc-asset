import { Injectable } from '@nestjs/common';
import { CachedRepository } from 'src/common/database/abstract/cached.repository';
import { PrismaUsersRepository } from './prisma-users.repository';
import { IDatabaseContext } from 'src/common/database/interface/db-context.interface';
import { CacheService } from 'src/common/cache/cache.service';

@Injectable()
export class UsersRepository extends CachedRepository<
  'User',
  PrismaUsersRepository
> {
  constructor(
    rawRepository: PrismaUsersRepository,
    cacheService: CacheService,
  ) {
    super(rawRepository, cacheService, 'user', 1800);
  }

  async findUniqueByIdCached(id: string, ctx?: IDatabaseContext) {
    const cacheKey = this.buildKey('id-unique', id);

    return this.getOrSet(
      cacheKey,
      () =>
        this.rawRepository.findUnique(
          {
            where: {
              id,
              deletedAt: null,
              isActive: true,
            },
          },
          ctx,
        ),
      ctx,
    );
  }

  async findByIdWithRoles(id: string, ctx?: IDatabaseContext) {
    const cacheKey = this.buildKey('id', id);
    return this.getOrSet(
      cacheKey,
      () => this.rawRepository.findByIdWithRoles(id, ctx),
      ctx,
    );
  }

  async findByIdWithPermissions(id: string, ctx?: IDatabaseContext) {
    const cacheKey = this.buildKey('id-permissions', id);
    return this.getOrSet(
      cacheKey,
      () => this.rawRepository.findByIdWithPermissions(id, ctx),
      ctx,
    );
  }

  async findByUsernameWithRoles(username: string, ctx?: IDatabaseContext) {
    const cacheKey = this.buildKey('username', username);
    return this.getOrSet(
      cacheKey,
      () => this.rawRepository.findByUsernameWithRoles(username, ctx),
      ctx,
    );
  }
}

export interface UsersRepository extends PrismaUsersRepository {}
