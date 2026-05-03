import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'node:crypto';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';

export interface AuthJwtPayload {
  sub: string;
  username: string;
  displayName: string;
  tokenVersion: number;
  roles: string[];
}

export interface GeneratedTokenPair {
  accessToken: string;
  refreshToken: string;
  tokenFamily: string;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  generateTokenPair(payload: AuthJwtPayload): GeneratedTokenPair {
    const accessToken = this.signAccessToken(payload);

    const refreshToken = this.generateRefreshToken();
    const tokenFamily = uuidv4();

    return {
      accessToken,
      refreshToken,
      tokenFamily,
    };
  }

  signAccessToken(payload: AuthJwtPayload): string {
    return this.jwtService.sign(payload);
  }

  generateRefreshToken(): string {
    return randomBytes(32).toString('base64url');
  }

  getAccessTokenExpiresInSeconds(): number {
    const expiresIn = this.configService.get<string>(
      'jwt.access.expiresIn',
      '900s',
    );
    const match = expiresIn.match(/^(\d+)([smhd])?$/);

    if (!match) return Number(expiresIn) || 900;

    const value = Number(match[1]);
    const unit = match[2] ?? 's';
    const multipliers: Record<string, number> = {
      s: 1,
      m: 60,
      h: 60 * 60,
      d: 24 * 60 * 60,
    };
    const multiplier = multipliers[unit] ?? 1;

    return value * multiplier;
  }

  hashRefreshToken(refreshToken: string): string {
    return createHash('sha256').update(refreshToken).digest('hex');
  }

  async verifyAccessToken(token: string): Promise<AuthJwtPayload> {
    return this.jwtService.verifyAsync<AuthJwtPayload>(token);
  }

  getRefreshTokenExpiresAt(): Date {
    const ttlDays = this.configService.get<number>('jwt.refresh.ttlDays', 30);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + ttlDays);
    return expiresAt;
  }
}
