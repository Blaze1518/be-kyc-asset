import { Logger } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { PrismaRepository } from 'src/prisma/prisma.repository';
import { IDatabaseContext } from 'src/common/database/interface/db-context.interface';

export abstract class CachedRepository<
  T extends Prisma.ModelName,
  Repo extends PrismaRepository<T>,
> {
  private readonly logger = new Logger(CachedRepository.name);
  constructor(
    protected readonly rawRepository: Repo,
    protected readonly cache: any,
    protected readonly prefix: string,
    protected readonly ttl: number = 3600,
  ) {
    return new Proxy(this, {
      get(target, prop, receiver) {
        if (prop in target) {
          return Reflect.get(target, prop, receiver);
        }

        const rawValue = Reflect.get(target.rawRepository as any, prop);
        if (typeof rawValue === 'function') {
          return rawValue.bind(target.rawRepository);
        }
        return rawValue;
      },
    }) as unknown as CachedRepository<T, Repo> & Repo;
  }

  protected buildKey(subPrefix: string, uniqueValue: string): string {
    return `cache:${this.prefix}:${subPrefix}:${uniqueValue}`;
  }

  protected async getOrSet<Result>(
    key: string,
    dbQueryFn: () => Promise<Result | null>,
    ctx?: IDatabaseContext,
  ): Promise<Result | null> {
    if (ctx) {
      this.logger.log(
        `[Cache Bypass] Đang dùng Database Context cho key: ${key}`,
      );
      return await dbQueryFn();
    }

    try {
      const cachedData = await this.cache.get(key);
      if (cachedData) {
        this.logger.log(`[Cache Hit] Lấy dữ liệu thành công từ key: ${key}`);
        return JSON.parse(cachedData) as Result;
      }
      this.logger.log(`[Cache Miss] Không tìm thấy dữ liệu cho key: ${key}`);
    } catch (cacheError) {
      this.logger.error(
        `[Cache Error] Thất bại khi đọc key ${key}:`,
        cacheError,
      );
    }

    const dbResult = await dbQueryFn();

    if (dbResult) {
      try {
        await this.cache.set(key, JSON.stringify(dbResult), this.ttl);
        this.logger.log(
          `[Cache Set] Đã lưu dữ liệu mới vào key: ${key} (TTL: ${this.ttl}s)`,
        );
      } catch (cacheSetError) {
        this.logger.error(
          `[Cache Error] Thất bại khi ghi key ${key}:`,
          cacheSetError,
        );
      }
    }

    return dbResult;
  }

  protected async evict(key: string): Promise<void> {
    try {
      await this.cache.del(key);
      this.logger.log(`[Cache Evict] Đã xóa thành công key: ${key}`);
    } catch (error) {
      this.logger.error(`[Cache Error] Không thể xóa key ${key}:`, error);
    }
  }
}
