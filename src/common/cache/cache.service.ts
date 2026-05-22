import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private redisClient: Redis;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6379);
    const password = this.configService.get<string>('REDIS_PASSWORD');

    this.redisClient = new Redis({
      host,
      port,
      password,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.redisClient.on('connect', () => {
      this.logger.log(`🚀 Kết nối Redis thành công tại ${host}:${port}`);
    });

    this.redisClient.on('error', (err) => {
      this.logger.error('💥 Lỗi kết nối Redis:', err);
    });
  }

  onModuleDestroy() {
    this.redisClient.disconnect();
  }

  /**
   * Lấy dữ liệu từ Cache
   */
  async get(key: string): Promise<string | null> {
    return await this.redisClient.get(key);
  }

  /**
   * Ghi dữ liệu vào Cache kèm thời gian hết hạn (TTL tính bằng giây)
   */
  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    await this.redisClient.set(key, value, 'EX', ttlSeconds);
  }

  /**
   * Xóa một Key cụ thể
   */
  async del(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  /**
   * VŨ KHÍ CHIẾN LƯỢC: Xóa các key theo Pattern (Ví dụ: `cache:user:*`)
   * Tận dụng cơ chế SCAN để không làm block single-thread của Redis (Tuyệt đối không dùng KEYS *)
   */
  async delByPattern(pattern: string): Promise<void> {
    const stream = this.redisClient.scanStream({
      match: pattern,
      count: 100, // Mỗi lần quét 100 keys để tránh nghẽn RAM
    });

    stream.on('data', async (keys: string[]) => {
      if (keys.length > 0) {
        // Sử dụng pipeline để xóa hàng loạt một cách tối ưu, giảm Round-trip Network
        const pipeline = this.redisClient.pipeline();
        keys.forEach((key) => pipeline.del(key));
        await pipeline.exec();
        this.logger.debug(
          `🧹 Đã dọn sạch ${keys.length} keys theo pattern: ${pattern}`,
        );
      }
    });

    return new Promise((resolve, reject) => {
      stream.on('end', () => resolve());
      stream.on('error', (err) => reject(err));
    });
  }
}
