import { registerAs } from '@nestjs/config';

export interface S3Config {
  endpoint: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
}

export default registerAs(
  's3',
  (): S3Config => ({
    endpoint: process.env.S3_ENDPOINT || 'http://localhost:8333',
    region: process.env.S3_REGION || 'us-east-1',
    accessKeyId: process.env.S3_ACCESS_KEY || 'my_access_key',
    secretAccessKey: process.env.S3_SECRET_KEY || 'my_secret_key_12345',
    bucketName: process.env.S3_BUCKET_NAME || 'attpay-media',
  }),
);
