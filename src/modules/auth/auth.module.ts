import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersRepository } from 'src/modules/users/repositories/users.repository';
import { PasswordHasher } from 'src/modules/users/password-hasher.service';
import { RefreshTokensRepository } from './repositories/refresh-tokens.repository';
import { TokenService } from './token.service';
import { ConfigService } from '@nestjs/config';
import { AuthCookieService } from './auth-cookie.service';
import { AuthMapper } from './auth.mapper';
import { UsersModule } from 'src/modules/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { AuthStrategy } from './constants/strategy.constant';
import { AccessTokenGuard } from './guards/access-token.guard';
import { AccessTokenStrategy } from './strategies/access-token.strategy';
@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: AuthStrategy.JWT_ACCESS }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('jwt.access.secret'),
        signOptions: {
          expiresIn: configService.get<string>(
            'jwt.access.expiresIn',
            '900s',
          ) as any,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    RefreshTokensRepository,
    TokenService,
    AccessTokenGuard,
    AccessTokenStrategy,
    AuthCookieService,
    AuthMapper,
  ],
})
export class AuthModule {}
