import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import type { Prisma } from 'src/generated/prisma/client';
import { TransactionManager } from 'src/common/database/abstract/transaction-manager.abstract';
import type { IDatabaseContext } from 'src/common/database/interface/db-context.interface';
import { UsersRepository } from 'src/modules/users/repositories/users.repository';
import type { UserWithRoles } from 'src/modules/users/repositories/users.repository';
import { PasswordHasher } from 'src/modules/users/password-hasher.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import {
  RefreshTokensRepository,
  RefreshTokenWithUser,
} from './repositories/refresh-tokens.repository';
import { TokenService } from './token.service';
import type { AuthJwtPayload } from './token.service';
import { UsersService } from '../users/users.service';
import type { AuthRequestMeta } from './interface/auth-meta.interface';

export interface AuthTokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthSessionResult extends AuthTokenPair {
  expiresIn: number;
  message: string;
  user: UserWithRoles;
}

export interface AuthMessageResult {
  message: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly txManager: TransactionManager,
    private readonly usersService: UsersService,
    private readonly usersRepository: UsersRepository,
    private readonly refreshTokensRepository: RefreshTokensRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService,
  ) {}

  async register(
    dto: RegisterDto,
    meta: AuthRequestMeta,
  ): Promise<AuthSessionResult> {
    return await this.txManager.run(async (ctx) => {
      const userWithRoles = await this.usersService.create(dto, ctx);
      return this.createSessionForUser(
        userWithRoles,
        {
          ...meta,
        },
        ctx,
        'Đăng ký thành công',
      );
    });
  }

  private buildPayload(user: UserWithRoles): AuthJwtPayload {
    return {
      sub: user.id,
      username: user.username,
      displayName: user.displayName,
      tokenVersion: user.token_version,
      roles: user.roles.map((userRole) => userRole.role.name),
    };
  }

  private normalizeIp(ipAddress?: string): string | undefined {
    if (!ipAddress) return undefined;

    return ipAddress.replace(/^::ffff:/, '');
  }

  private ensureRefreshTokenUsable(token: RefreshTokenWithUser) {
    if (
      token.is_revoked ||
      token.used_at ||
      token.expires_at.getTime() <= Date.now()
    ) {
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }

    if (!token.user.isActive || token.user.deletedAt) {
      throw new UnauthorizedException('Tài khoản không còn hoạt động');
    }
  }

  private async createSessionForUser(
    user: UserWithRoles,
    meta: AuthRequestMeta,
    ctx: IDatabaseContext,
    message: string,
    tokenFamily?: string,
  ): Promise<AuthSessionResult> {
    const tokenPair = this.tokenService.generateTokenPair(
      this.buildPayload(user),
    );

    await this.refreshTokensRepository.create(
      {
        data: {
          user_id: user.id,
          token_hash: this.tokenService.hashRefreshToken(
            tokenPair.refreshToken,
          ),
          token_family: tokenFamily ?? tokenPair.tokenFamily,
          expires_at: this.tokenService.getRefreshTokenExpiresAt(),
          device_id: meta.deviceId,
          device_name: meta.deviceName,
          ip_address: this.normalizeIp(meta.ipAddress),
          user_agent: meta.userAgent,
        },
      },
      ctx,
    );

    return {
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      expiresIn: this.tokenService.getAccessTokenExpiresInSeconds(),
      message,
      user,
    };
  }

  async login(
    dto: LoginDto,
    meta: AuthRequestMeta,
  ): Promise<AuthSessionResult> {
    const user = await this.usersRepository.findByUsernameWithRoles(
      dto.username,
    );

    if (!user) {
      throw new UnauthorizedException('Thông tin đăng nhập không hợp lệ');
    }

    const isPasswordValid = await this.passwordHasher.verify(
      dto.password,
      user.hashed_password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Thông tin đăng nhập không hợp lệ');
    }

    return this.txManager.run((ctx) =>
      this.createSessionForUser(
        user,
        {
          ...meta,
        },
        ctx,
        'Đăng nhập thành công',
      ),
    );
  }

  async refresh(
    refreshTokenValue: string,
    meta: AuthRequestMeta,
  ): Promise<AuthSessionResult> {
    const tokenHash = this.tokenService.hashRefreshToken(refreshTokenValue);
    const storedToken =
      await this.refreshTokensRepository.findByHash(tokenHash);

    if (!storedToken) {
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }

    if (storedToken.is_revoked || storedToken.used_at) {
      await this.txManager.run(async (ctx) => {
        await this.refreshTokensRepository.revokeFamily(
          storedToken.token_family,
          ctx,
        );
        await this.usersRepository.update(
          {
            where: { id: storedToken.user_id },
            data: {
              token_version: { increment: 1 },
            },
          },
          ctx,
        );
      });
      throw new UnauthorizedException('Refresh token đã bị sử dụng lại');
    }

    this.ensureRefreshTokenUsable(storedToken);

    return await this.txManager.run(async (ctx) => {
      await this.refreshTokensRepository.revokeByHash(tokenHash, ctx);

      const user = await this.usersRepository.findByIdWithRoles(
        storedToken.user_id,
        ctx,
      );

      if (!user || !user.isActive || user.deletedAt) {
        throw new UnauthorizedException('Tài khoản không còn hoạt động');
      }

      return this.createSessionForUser(
        user,
        meta,
        ctx,
        'Làm mới phiên đăng nhập thành công',
        storedToken.token_family,
      );
    });
  }

  async logout(
    refreshTokenValue: string | undefined,
  ): Promise<AuthMessageResult> {
    if (!refreshTokenValue) {
      throw new UnauthorizedException('Thiếu refresh token');
    }

    const tokenHash = this.tokenService.hashRefreshToken(refreshTokenValue);
    await this.refreshTokensRepository.revokeByHash(tokenHash);

    return { message: 'Đăng xuất thành công' };
  }

  async me(payload: AuthJwtPayload): Promise<UserWithRoles> {
    const user = await this.usersRepository.findByIdWithRoles(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Tài khoản không còn hoạt động');
    }

    return user;
  }

  async changePassword(
    payload: AuthJwtPayload,
    dto: ChangePasswordDto,
  ): Promise<AuthMessageResult> {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('Xác nhận mật khẩu mới không khớp');
    }

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException(
        'Mật khẩu mới không được trùng mật khẩu cũ',
      );
    }

    const user = await this.usersRepository.findByIdWithRoles(payload.sub);

    if (!user || !user.isActive || user.deletedAt) {
      throw new UnauthorizedException('Tài khoản không còn hoạt động');
    }

    const isCurrentPasswordValid = await this.passwordHasher.verify(
      dto.currentPassword,
      user.hashed_password,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Mật khẩu hiện tại không đúng');
    }

    const hashedPassword = await this.passwordHasher.hash(dto.newPassword);

    await this.txManager.run(async (ctx) => {
      await this.usersRepository.update(
        {
          where: { id: user.id },
          data: {
            hashed_password: hashedPassword,
            token_version: { increment: 1 },
          } satisfies Prisma.UserUpdateInput,
        },
        ctx,
      );

      await this.refreshTokensRepository.revokeAllForUser(user.id, ctx);
    });

    return { message: 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại.' };
  }
}
