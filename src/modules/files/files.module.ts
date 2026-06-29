import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { S3Config } from '../../config/s3.config';
import { PortsModule } from '../ports/ports.module';

@Module({
  imports: [PortsModule],
  controllers: [FilesController],
  providers: [
    FilesService,
    {
      provide: 'S3_CLIENT',
      useFactory: (configService: ConfigService) => {
        const s3Config = configService.get<S3Config>('s3')!;
        return new S3Client({
          endpoint: s3Config.endpoint,
          region: s3Config.region,
          credentials: {
            accessKeyId: s3Config.accessKeyId,
            secretAccessKey: s3Config.secretAccessKey,
          },
          forcePathStyle: true,
          requestChecksumCalculation: 'WHEN_REQUIRED',
        });
      },
      inject: [ConfigService],
    },
  ],
})
export class FilesModule {}
