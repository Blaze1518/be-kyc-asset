import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { UsersModule } from './modules/users/users.module';
import { WhitelistIpModule } from './modules/whitelist-ip/whitelist-ip.module';
import { RolesModule } from './modules/roles/roles.module';
import { PermissionsModule } from './modules/access-control/permissions/permissions.module';
import { AuthModule } from './modules/auth/auth.module';
import { CommonModule } from './common/common.module';
import { PrismaModule } from '../src/prisma/prisma.module';
import { AttributeModule } from './modules/access-control/attribute/attribute.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { PortsModule } from './modules/ports/ports.module';
import { FilesModule } from './modules/files/files.module';

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
    DepartmentsModule,
    PortsModule,
    FilesModule,
  ],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
