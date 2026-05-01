import { registerAs } from '@nestjs/config';

export interface DatabaseConfig {
  type: string;
  host: string;
  port: number;
  user: string;
  pass: string;
  name: string;
  uri?: string;
  synchronize: boolean;
}

export default registerAs(
  'database',
  (): DatabaseConfig => ({
    type: process.env.DB_TYPE || 'postgres',
    host: process.env.DB_HOST!,
    port: +(process.env.DB_PORT || 5432),
    user: process.env.DB_USERNAME!,
    pass: process.env.DB_PASSWORD || '',
    name: process.env.DB_DATABASE!,
    uri: process.env.DB_URI,
    synchronize: process.env.NODE_ENV !== 'production',
  }),
);
