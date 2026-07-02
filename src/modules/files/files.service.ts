import {
  Injectable,
  BadRequestException,
  Inject,
  OnModuleInit,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
  CreateBucketCommand,
  HeadBucketCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3Config } from '../../config/s3.config';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import {
  DepartmentPortParamsDto,
  FileRouteParamsDto,
} from './dto/file-params.dto';
import { PortsService } from '../ports/ports.service';
import { UploadRequestDto, FileTypeEnum } from './dto/upload-request.dto';
import * as path from 'path';

@Injectable()
export class FilesService implements OnModuleInit {
  private readonly logger = new Logger(FilesService.name);
  private readonly bucketName: string;
  private readonly FILE_LIMITS = {
    [FileTypeEnum.IMAGE]: {
      extensions: ['.jpg', '.png', '.webp'],
      maxSize: 10 * 1024 * 1024,
      label: 'Ảnh',
    },
    [FileTypeEnum.VIDEO]: {
      extensions: ['.mp4', '.mov'],
      maxSize: 500 * 1024 * 1024,
      label: 'Video',
    },
  };

  constructor(
    // private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly portsService: PortsService,
    @Inject('S3_CLIENT') private readonly s3Client: S3Client,
  ) {
    const s3Config = this.configService.get<S3Config>('s3')!;
    this.bucketName = s3Config.bucketName;
  }

  async onModuleInit() {
    try {
      await this.s3Client.send(
        new HeadBucketCommand({ Bucket: this.bucketName }),
      );
    } catch (error: any) {
      if (
        error.name === 'NotFound' ||
        error.$metadata?.httpStatusCode === 404
      ) {
        try {
          await this.s3Client.send(
            new CreateBucketCommand({ Bucket: this.bucketName }),
          );
          this.logger.log(
            `[SeaweedFS] Bucket ${this.bucketName} đã được tạo thành công.`,
          );
        } catch (createError) {
          this.logger.error(`[SeaweedFS] Không thể tạo bucket:`, createError);
        }
      } else {
        this.logger.error(`[SeaweedFS] Lỗi kết nối server:`, error);
      }
    }
  }

  async generateUploadUrl(
    params: DepartmentPortParamsDto,
    uploadRequestDto: UploadRequestDto,
  ) {
    const { fileName, fileSize } = uploadRequestDto;
    const { departmentCode, portCode } = params;
    const isValidPort = await this.portsService.validatePortBelongsToDepartment(
      departmentCode,
      portCode,
    );

    if (!isValidPort) {
      throw new BadRequestException(
        `Cổng #${portCode} không tồn tại hoặc không thuộc site #${departmentCode}`,
      );
    }

    const ext = path.extname(fileName).toLowerCase();
    const fileType = Object.keys(this.FILE_LIMITS).find((type) =>
      this.FILE_LIMITS[type].extensions.includes(ext),
    );

    if (!fileType) {
      throw new BadRequestException(
        `Định dạng file ${ext} không được hỗ trợ trên hệ thống`,
      );
    }

    const limits = this.FILE_LIMITS[fileType];

    if (!limits) {
      throw new BadRequestException('Loại file không được hỗ trợ');
    }

    if (!limits.extensions.includes(ext)) {
      throw new BadRequestException(
        `Định dạng file ${ext} không được hỗ trợ cho nhóm ${limits.label}. Cho phép: ${limits.extensions.join(', ')}`,
      );
    }

    if (fileSize > limits.maxSize) {
      const maxMb = limits.maxSize / (1024 * 1024);
      throw new BadRequestException(
        `Dung lượng file vượt quá giới hạn cho phép (Tối đa ${maxMb}MB cho nhóm ${limits.label})`,
      );
    }

    const baseName = path.basename(fileName, ext);
    const uniqueFileName = this.generateUniqueFileName(baseName, ext);

    const s3Key = `${departmentCode}/${portCode}/${uniqueFileName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: s3Key,
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: 900,
    });

    const s3Config = this.configService.get<S3Config>('s3')!;
    const fileUrl = `${s3Config.endpoint}/${this.bucketName}/${s3Key}`;

    return {
      uploadUrl,
      fileUrl,
      fileName: uniqueFileName,
    };
  }

  async findAllByPort(params: DepartmentPortParamsDto): Promise<any[]> {
    const { departmentCode, portCode } = params;

    const isValidPort = await this.portsService.validatePortBelongsToDepartment(
      departmentCode,
      portCode,
    );

    if (!isValidPort) {
      throw new BadRequestException(
        `Cổng #${portCode} không tồn tại hoặc không thuộc site #${departmentCode}`,
      );
    }

    const prefix = `${departmentCode}/${portCode}/`;

    const command = new ListObjectsV2Command({
      Bucket: this.bucketName,
      Prefix: prefix,
    });

    try {
      const response = await this.s3Client.send(command);

      if (!response.Contents || response.Contents.length === 0) {
        return [];
      }

      const s3Config = this.configService.get<S3Config>('s3')!;

      // const cdnBaseUrl = s3Config?.cdnUrl || 'https://mediatest22114.attapps.com';
      const cdnBaseUrl = 'https://mediatest22114.attapps.com';

      return response.Contents.map((item) => {
        return {
          fileName: path.basename(item.Key!),
          fileSize: item.Size || 0,
          lastModified: item.LastModified,
          url: `${cdnBaseUrl}/storage/media/${item.Key}`,
        };
      });
    } catch (error: any) {
      this.logger.error(
        `[SeaweedFS] Thất bại khi quét danh sách file tại phân vùng ${prefix}:`,
        error,
      );
      throw new InternalServerErrorException(
        'Lỗi hệ thống không thể truy xuất danh sách tệp tin từ lõi lưu trữ',
      );
    }
  }

  create(createFileDto: CreateFileDto) {
    return 'This action adds a new file';
  }

  findAll() {
    return `This action returns all files`;
  }

  findOne(id: number) {
    return `This action returns a #${id} file`;
  }

  update(id: number, updateFileDto: UpdateFileDto) {
    return `This action updates a #${id} file`;
  }

  remove(id: number) {
    return `This action removes a #${id} file`;
  }

  private generateUniqueFileName(baseName: string, ext: string): string {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const date = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    const timestamp = `${year}${month}${date}${hours}${minutes}${seconds}`;

    const randomStr = Math.random().toString(36).substring(2, 6);

    return `${baseName}_${timestamp}_${randomStr}${ext}`;
  }
}
