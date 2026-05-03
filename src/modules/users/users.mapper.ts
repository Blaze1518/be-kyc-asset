import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ResponseUserDto } from './dto/response-user.dto';
import { UserWithRoles } from './repositories/users.repository';

export interface PaginatedUsers<T> {
  items: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable()
export class UsersMapper {
  toResponse(user: UserWithRoles): ResponseUserDto {
    return plainToInstance(
      ResponseUserDto,
      {
        ...user,
        tokenVersion: user.token_version,
        roles: user.roles.map((userRole) => userRole.role),
      },
      { excludeExtraneousValues: true },
    );
  }

  toPaginatedResponse(
    users: PaginatedUsers<UserWithRoles>,
  ): PaginatedUsers<ResponseUserDto> {
    return {
      items: users.items.map((user) => this.toResponse(user)),
      meta: users.meta,
    };
  }
}
