import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { UsersModule } from './modules/users/users.module';
import { WhitelistIpModule } from './modules/whitelist-ip/whitelist-ip.module';
import { RolesModule } from './modules/roles/roles.module';
import { PermissionsModule } from './modules/access-control/permissions/permissions.module';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { PrismaModule } from '../src/prisma/prisma.module';
import { AttributeModule } from './modules/access-control/attribute/attribute.module';

@Module({
  imports: [
    CommonModule,
    UsersModule,
    WhitelistIpModule,
    RolesModule,
    PermissionsModule,
    AuthModule,
    PrismaModule,
    AttributeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
