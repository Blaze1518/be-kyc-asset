// src/prisma/prisma.service.ts
import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { DatabaseConfig } from 'src/config/database.config';
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(private configService: ConfigService) {
    const dbConfig = configService.getOrThrow<DatabaseConfig>('database');

    if (!dbConfig) {
      throw new Error('Database configuration not found!');
    }

    const connectionString =
      dbConfig.uri ||
      `postgresql://${dbConfig.user}:${encodeURIComponent(dbConfig.pass)}@${dbConfig.host}:${dbConfig.port}/${dbConfig.name}?schema=public`;

    const adapter = new PrismaPg({ connectionString });

    super({
      adapter,
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'error' },
      ],
    });
    const maskedUrl = connectionString.replace(/:([^:@]+)@/, ':******@');
    this.logger.log(`🔌 Prisma Connection String: ${maskedUrl}`);
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Kết nối database thành công');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.warn('Ngắt kết nối database');
  }
}
