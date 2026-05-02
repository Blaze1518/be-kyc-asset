import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { TransactionManager } from 'src/common/database/abstract/transaction-manager.abstract';
import {
  UsersRepository,
  UserWithRoles,
} from './repositories/users.repository';
import { UserRolesRepository } from './repositories/user-roles.repository';
import { PasswordHasher } from './password-hasher.service';
import { QueryDto } from 'src/common/dto/query.dto';
import { plainToInstance } from 'class-transformer';
import { ResponseUserDto } from './dto/response-user.dto';
import { IDatabaseContext } from 'src/common/database/interface/db-context.interface';

@Injectable()
export class UsersService {
  constructor(
    private readonly txManager: TransactionManager,
    private readonly usersRepository: UsersRepository,
    private readonly userRolesRepository: UserRolesRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  private toResponse(user: UserWithRoles): ResponseUserDto {
    return plainToInstance(
      ResponseUserDto,
      {
        ...user,
        roles: user.roles.map((userRole) => userRole.role),
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }

  private async findUserOrThrow(
    id: string,
    ctx?: IDatabaseContext,
  ): Promise<UserWithRoles> {
    const user = await this.usersRepository.findByIdWithRoles(id, ctx);

    if (!user) {
      throw new NotFoundException(`User với ID #${id} không tồn tại`);
    }

    return user;
  }

  async create(createUserDto: CreateUserDto) {
    return await this.txManager.run(async (ctx) => {
      const hashedPassword = await this.passwordHasher.hash(
        createUserDto.password,
      );

      const user = await this.usersRepository.create(
        {
          data: {
            username: createUserDto.username,
            displayName: createUserDto.displayName,
            hashed_password: hashedPassword,
          },
        },
        ctx,
      );
      const userId = user.id as string;

      if (createUserDto.roles && createUserDto.roles.length > 0) {
        await this.userRolesRepository.createMany(
          {
            data: createUserDto.roles.map((role) => ({
              user_id: userId,
              role_id: role.id,
            })),
          },
          ctx,
        );
      }

      const createdUser = await this.findUserOrThrow(userId, ctx);
      return this.toResponse(createdUser);
    });
  }

  async findAll(query: QueryDto) {
    const { search, page = 1, limit = 10, ...paginationParams } = query;
    let where = {
      deletedAt: null,
    };

    if (search) {
      where = {
        ...where,
        OR: [
          { username: { contains: search, mode: 'insensitive' } },
          { displayName: { contains: search, mode: 'insensitive' } },
        ],
      } as typeof where;
    }

    const [items, total] = await this.usersRepository.findManyPaginated(
      { page, limit, ...paginationParams },
      where,
    );

    return {
      items: items.map((item) => this.toResponse(item)),
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const user = await this.findUserOrThrow(id);
    return this.toResponse(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    return await this.txManager.run(async (ctx) => {
      const data: {
        displayName?: string;
        isActive?: boolean;
        hashed_password?: string;
        token_version?: { increment: number };
      } = {};

      if (updateUserDto.displayName !== undefined) {
        data.displayName = updateUserDto.displayName;
      }

      if (updateUserDto.isActive !== undefined) {
        data.isActive = updateUserDto.isActive;
      }

      if (updateUserDto.password !== undefined) {
        data.hashed_password = await this.passwordHasher.hash(
          updateUserDto.password,
        );
        data.token_version = { increment: 1 };
      }

      await this.usersRepository.update(
        {
          where: { id },
          data,
        },
        ctx,
      );

      if (updateUserDto.roles !== undefined) {
        await this.userRolesRepository.deleteMany(
          {
            where: { user_id: id },
          },
          ctx,
        );

        if (updateUserDto.roles.length > 0) {
          await this.userRolesRepository.createMany(
            {
              data: updateUserDto.roles.map((role) => ({
                user_id: id,
                role_id: role.id,
              })),
            },
            ctx,
          );
        }
      }

      const updatedUser = await this.findUserOrThrow(id, ctx);
      return this.toResponse(updatedUser);
    });
  }

  async remove(id: string) {
    return await this.txManager.run(async (ctx) => {
      await this.findUserOrThrow(id, ctx);

      await this.usersRepository.update(
        {
          where: { id },
          data: {
            deletedAt: new Date(),
            isActive: false,
            token_version: { increment: 1 },
          } as any,
        },
        ctx,
      );

      const deletedUser = await this.usersRepository.findUnique(
        {
          where: { id },
        },
        ctx,
      );

      return plainToInstance(ResponseUserDto, deletedUser, {
        excludeExtraneousValues: true,
      });
    });
  }
}
