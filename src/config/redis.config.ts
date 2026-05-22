import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => ({
  host: process.env.REDIS_HOST,
  port: +(process.env.REDIS_PORT || 6379),
  password: process.env.REDIS_PASSWORD,
  uri: process.env.REDIS_URI,
}));
