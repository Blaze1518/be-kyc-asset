import { AuthStrategy } from '../constants/strategy.constant';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { UsersService } from 'src/modules/users/users.service';
import { AuthJwtPayload } from '../token.service';
import { AppException } from 'src/common/exceptions/app.exception';
import { ERROR_REGISTRY } from 'src/common/exceptions/error-registry';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(
  Strategy,
  AuthStrategy.JWT_ACCESS,
) {
  private readonly logger = new Logger(AccessTokenStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.access_token;
        },
      ]),
      ignoreExpiration: false,
      algorithms: ['HS256'],
      secretOrKey: configService.getOrThrow<string>('jwt.access.secret'),
      passReqToCallback: true,
      jsonWebTokenOptions: {
        clockTolerance: 30,
      },
    });
  }

  async validate(req: Request, payload: any) {
    const { id: userId, tokenVersion } = payload;
    this.logger.log(`debugpayload: ${JSON.stringify(payload)}`);
    const user = await this.usersService.findOneById(userId);
    this.logger.log(`user: ${JSON.stringify(user)}`);
    if (!user || !user.isActive || user.deletedAt) {
      this.logger.warn(
        `Xác thực thất bại: User ${userId} không tồn tại hoặc bị khóa. IP: ${req.ip}`,
      );
      throw new AppException(ERROR_REGISTRY.UNAUTHORIZED);
    }
    if (tokenVersion !== user.token_version) {
      this.logger.warn(
        `Token lỗi thời: User ${user.username} (ID: ${userId}) thử truy cập bằng version ${tokenVersion}, bản hiện tại là ${user.token_version}. IP: ${req.ip}`,
      );
      throw new AppException(ERROR_REGISTRY.UNAUTHORIZED);
    }
    return user;
  }
}
