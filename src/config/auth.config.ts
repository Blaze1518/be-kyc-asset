import { registerAs } from '@nestjs/config';

export interface AuthConfig {
  access: {
    secret: string;
    expiresIn: string;
  };
  refresh: {
    ttlDays: number;
  };
}

export default registerAs(
  'jwt',
  (): AuthConfig => ({
    access: {
      secret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret',
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '900s',
    },
    refresh: {
      ttlDays: Number(process.env.REFRESH_TOKEN_TTL_DAYS || 30),
    },
  }),
);
