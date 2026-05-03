import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import type { AuthTokenPair } from './auth.service';
import { TokenService } from './token.service';

const ACCESS_TOKEN_COOKIE = 'access_token';
const REFRESH_TOKEN_COOKIE = 'refresh_token';

type RequestWithCookies = Request & {
  cookies?: Record<string, string | undefined>;
};

@Injectable()
export class AuthCookieService {
  constructor(
    private readonly configService: ConfigService,
    private readonly tokenService: TokenService,
  ) {}

  setAuthCookies(response: Response, tokenPair: AuthTokenPair): void {
    response.cookie(ACCESS_TOKEN_COOKIE, tokenPair.accessToken, {
      ...this.baseCookieOptions(),
      path: '/',
      maxAge: this.tokenService.getAccessTokenExpiresInSeconds() * 1000,
    });

    response.cookie(REFRESH_TOKEN_COOKIE, tokenPair.refreshToken, {
      ...this.baseCookieOptions(),
      path: '/auth/refresh',
      maxAge: this.getRefreshTokenTtlMs(),
    });
  }

  clearAuthCookies(response: Response): void {
    response.clearCookie(ACCESS_TOKEN_COOKIE, {
      ...this.baseCookieOptions(),
      path: '/',
    });

    response.clearCookie(REFRESH_TOKEN_COOKIE, {
      ...this.baseCookieOptions(),
      path: '/auth/refresh',
    });
  }

  getRefreshToken(request: Request): string | undefined {
    return (request as RequestWithCookies).cookies?.[REFRESH_TOKEN_COOKIE];
  }

  private baseCookieOptions() {
    return {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'strict' as const,
    };
  }

  private getRefreshTokenTtlMs(): number {
    const ttlDays = this.configService.get<number>('jwt.refresh.ttlDays', 30);
    return ttlDays * 24 * 60 * 60 * 1000;
  }
}
