import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validate } from 'src/config/env.validation';
import databaseConfig from 'src/config/database.config';
import authConfig from 'src/config/auth.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [databaseConfig, authConfig],
      validate: validate,
    }),
  ],
})
export class CommonModule {}
