import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersRepository } from './repositories/users.repository';
import { UserRolesRepository } from './repositories/user-roles.repository';
import { PasswordHasher } from './password-hasher.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, UserRolesRepository, PasswordHasher],
})
export class UsersModule {}
