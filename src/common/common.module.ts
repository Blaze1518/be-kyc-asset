import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validate } from 'src/config/env.validation';
import databaseConfig from 'src/config/database.config';
import authConfig from 'src/config/auth.config';
import redisConfig from 'src/config/redis.config';
import s3Config from 'src/config/s3.config';
import { AccessTokenGuard } from 'src/modules/auth/guards/access-token.guard';
import { CacheModule } from 'src/common/cache/cache.module';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [databaseConfig, authConfig, redisConfig, s3Config],
      validate: validate,
    }),
    CacheModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
  ],
})
export class CommonModule {}
