import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
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
import { IDatabaseContext } from 'src/common/database/interface/db-context.interface';

export interface UsersPageResult {
  items: UserWithRoles[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable()
export class UsersService {
  constructor(
    private readonly txManager: TransactionManager,
    private readonly usersRepository: UsersRepository,
    private readonly userRolesRepository: UserRolesRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

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

  async create(
    createUserDto: CreateUserDto,
    ctx?: IDatabaseContext,
  ): Promise<UserWithRoles> {
    if (ctx) {
      return this.createWithContext(createUserDto, ctx);
    }
    return this.txManager.run((txCtx) =>
      this.createWithContext(createUserDto, txCtx),
    );
  }

  private async createWithContext(
    createUserDto: CreateUserDto,
    ctx: IDatabaseContext,
  ): Promise<UserWithRoles> {
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
    if (createUserDto.roles?.length) {
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
    const createdUser = await this.usersRepository.findByIdWithRoles(
      userId,
      ctx,
    );
    if (!createdUser) {
      throw new BadRequestException('Không thể tải lại user sau khi tạo');
    }
    return createdUser;
  }

  async findAll(query: QueryDto): Promise<UsersPageResult> {
    const { search, page = 1, limit = 10, ...paginationParams } = query;
    let where: Prisma.UserWhereInput = {
      deletedAt: null,
    };

    if (search) {
      where = {
        ...where,
        OR: [
          { username: { contains: search, mode: 'insensitive' } },
          { displayName: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const [items, total] = await this.usersRepository.findManyPaginated(
      { page, limit, ...paginationParams },
      where,
    );

    return {
      items,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<UserWithRoles> {
    return this.findUserOrThrow(id);
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserWithRoles> {
    return this.txManager.run((ctx) =>
      this.updateWithContext(id, updateUserDto, ctx),
    );
  }

  private async updateWithContext(
    id: string,
    updateUserDto: UpdateUserDto,
    ctx: IDatabaseContext,
  ): Promise<UserWithRoles> {
    const data: Prisma.UserUpdateInput = {};

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

    return this.findUserOrThrow(id, ctx);
  }

  async remove(id: string): Promise<UserWithRoles> {
    return this.txManager.run((ctx) => this.removeWithContext(id, ctx));
  }

  private async removeWithContext(
    id: string,
    ctx: IDatabaseContext,
  ): Promise<UserWithRoles> {
    await this.findUserOrThrow(id, ctx);

    await this.usersRepository.update(
      {
        where: { id },
        data: {
          deletedAt: new Date(),
          isActive: false,
          token_version: { increment: 1 },
        },
      },
      ctx,
    );

    const deletedUser = await this.usersRepository.findUniqueWithRoles(id, ctx);

    if (!deletedUser) {
      throw new BadRequestException('Không thể tải lại user sau khi xóa');
    }

    return deletedUser;
  }
}
