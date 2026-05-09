import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { AppException } from 'src/common/exceptions/app.exception';
import { ERROR_REGISTRY } from 'src/common/exceptions/error-registry';
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
import { AuthMapper } from './auth.mapper';
import { ConfigService } from '@nestjs/config';

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

type TokenPayloadSource = {
  id: string;
  token_version: number;
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly txManager: TransactionManager,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly usersRepository: UsersRepository,
    private readonly refreshTokensRepository: RefreshTokensRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService,
    private readonly authMapper: AuthMapper,
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

  private buildPayload(user: TokenPayloadSource): AuthJwtPayload {
    return {
      id: user.id,
      tokenVersion: user.token_version,
    };
  }

  private normalizeIp(ipAddress?: string): string | undefined {
    if (!ipAddress) return undefined;

    return ipAddress.replace(/^::ffff:/, '');
  }

  private ensureUserActive(user: {
    isActive: boolean;
    deletedAt: Date | null;
  }) {
    if (!user.isActive || user.deletedAt) {
      throw new AppException(ERROR_REGISTRY.USER_NOT_FOUND);
    }
  }

  private ensureRefreshTokenUsable(token: RefreshTokenWithUser) {
    if (
      token.is_revoked ||
      token.used_at ||
      token.expires_at.getTime() <= Date.now()
    ) {
      throw new AppException(ERROR_REGISTRY.INVALID_REFRESH_TOKEN);
    }

    this.ensureUserActive(token.user);
  }

  private async persistRefreshToken(
    params: {
      userId: string;
      refreshToken: string;
      tokenFamily: string;
      meta: AuthRequestMeta;
    },
    ctx: IDatabaseContext,
  ) {
    await this.refreshTokensRepository.create(
      {
        data: {
          user_id: params.userId,
          token_hash: this.tokenService.hashRefreshToken(params.refreshToken),
          token_family: params.tokenFamily,
          expires_at: this.tokenService.getRefreshTokenExpiresAt(),
          device_id: params.meta.deviceId,
          device_name: params.meta.deviceName,
          ip_address: this.normalizeIp(params.meta.ipAddress),
          user_agent: params.meta.userAgent,
        },
      },
      ctx,
    );
  }

  private async createTokenPairForUser(
    user: TokenPayloadSource,
    meta: AuthRequestMeta,
    ctx: IDatabaseContext,
    tokenFamily?: string,
  ): Promise<AuthTokenPair> {
    const tokenPair = this.tokenService.generateTokenPair(
      this.buildPayload(user),
    );

    await this.persistRefreshToken(
      {
        userId: user.id,
        refreshToken: tokenPair.refreshToken,
        tokenFamily: tokenFamily ?? tokenPair.tokenFamily,
        meta,
      },
      ctx,
    );

    return {
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
    };
  }

  private async createSessionForUser(
    user: UserWithRoles & TokenPayloadSource,
    meta: AuthRequestMeta,
    ctx: IDatabaseContext,
    message: string,
    tokenFamily?: string,
  ): Promise<AuthSessionResult> {
    const tokenPair = await this.createTokenPairForUser(
      user,
      meta,
      ctx,
      tokenFamily,
    );

    return {
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      expiresIn: this.tokenService.getAccessTokenExpiresInSeconds(),
      message,
      user,
    };
  }

  async login(dto: LoginDto, meta: AuthRequestMeta): Promise<AuthTokenPair> {
    const user = await this.usersRepository.findUnique({
      where: {
        username: dto.username,
      },
    });

    if (
      !user ||
      !(await this.passwordHasher.verify(dto.password, user.hashed_password))
    ) {
      throw new AppException(ERROR_REGISTRY.INVALID_CREDENTIALS);
    }

    return this.txManager.run(async (ctx) => {
      return await this.createTokenPairForUser(
        user as unknown as TokenPayloadSource,
        meta,
        ctx,
      );
    });
  }

  async refresh(
    refreshTokenValue: string,
    meta: AuthRequestMeta,
  ): Promise<AuthTokenPair> {
    const tokenHash = this.tokenService.hashRefreshToken(refreshTokenValue);
    const now = new Date();
    const gracePeriodMs =
      (this.configService.get<number>('AUTH_REFRESH_GRACE_PERIOD_SECONDS') ||
        10) * 1000;

    return await this.txManager.run(async (ctx) => {
      const updateResult = await this.refreshTokensRepository.updateMany(
        {
          where: {
            token_hash: tokenHash,
            used_at: null,
            is_revoked: false,
            expires_at: { gt: now },
          },
          data: {
            used_at: now,
            is_revoked: true,
          },
        },
        ctx,
      );

      if (updateResult.count === 1) {
        const storedToken = await this.refreshTokensRepository.findUnique(
          {
            where: { token_hash: tokenHash },
            include: { user: true },
          },
          ctx,
        );

        if (!storedToken?.user.isActive || storedToken?.user.deletedAt) {
          throw new AppException(ERROR_REGISTRY.USER_NOT_FOUND);
        }

        return await this.createTokenPairForUser(
          storedToken.user as any,
          meta,
          ctx,
          storedToken.token_family,
        );
      }

      const tokenStatus = await this.refreshTokensRepository.findUnique(
        {
          where: { token_hash: tokenHash },
        },
        ctx,
      );

      if (!tokenStatus)
        throw new AppException(ERROR_REGISTRY.INVALID_REFRESH_TOKEN);
      if (tokenStatus.expires_at <= now)
        throw new AppException(ERROR_REGISTRY.TOKEN_EXPIRED);

      if (tokenStatus.used_at || tokenStatus.is_revoked) {
        const timeSinceUsed =
          now.getTime() - (tokenStatus.used_at?.getTime() || 0);

        if (timeSinceUsed < gracePeriodMs) {
          throw new AppException(ERROR_REGISTRY.REFRESH_TOKEN_PENDING);
        }

        await this.refreshTokensRepository.revokeFamily(
          tokenStatus.token_family,
          ctx,
        );
        await this.usersRepository.update(
          {
            where: { id: tokenStatus.user_id },
            data: { token_version: { increment: 1 } },
          },
          ctx,
        );

        throw new AppException(ERROR_REGISTRY.INVALID_REFRESH_TOKEN);
      }

      throw new AppException(ERROR_REGISTRY.INVALID_REFRESH_TOKEN);
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

  async me(payload: AuthJwtPayload) {
    const user = await this.usersRepository.findByIdWithPermissions(payload.id);
    if (!user) {
      throw new UnauthorizedException('Tài khoản không còn hoạt động');
    }

    return this.authMapper.toMeResponse(user);
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

    const user = await this.usersRepository.findByIdWithRoles(payload.id);

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
