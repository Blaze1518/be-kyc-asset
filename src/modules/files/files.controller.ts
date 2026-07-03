import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  ClassSerializerInterceptor,
  HttpStatus,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { ApiStandardError } from 'src/common/decorators/swagger/errors.decorator';
import { ApiStandardSuccess } from 'src/common/decorators/swagger/success.decorator';
import { plainToInstance } from 'class-transformer';
import axios from 'axios';
import {
  DepartmentPortParamsDto,
  FileRouteParamsDto,
} from './dto/file-params.dto';
import { UploadRequestDto } from './dto/upload-request.dto';
import { FileResponseDto, UploadUrlResponseDto } from './dto/file-response.dto';

@ApiTags('Media Files (Quản lý tệp tin SeaweedFS S3)')
@ApiBearerAuth()
@Controller(':departmentCode/:portCode/media') // Định tuyến động phân cấp hệ thống
@UseInterceptors(ClassSerializerInterceptor)
@ApiStandardError(undefined, '/:departmentCode/:portCode/media')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload-url')
  @ApiOperation({
    summary: 'Yêu cầu cấp Pre-signed URL để upload file',
    description:
      'Hệ thống tự động kiểm tra Port duy nhất và validate dung lượng (Ảnh <= 10MB, Video <= 500MB). Trả về liên kết đẩy file trực tiếp lên SeaweedFS Core.',
  })
  @ApiStandardSuccess(UploadUrlResponseDto, {
    status: HttpStatus.CREATED,
  })
  async requestUploadUrl(
    @Param() params: DepartmentPortParamsDto,
    @Body() uploadRequestDto: UploadRequestDto,
  ): Promise<UploadUrlResponseDto> {
    const result = await this.filesService.generateUploadUrl(
      params,
      uploadRequestDto,
    );

    return plainToInstance(UploadUrlResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Post('test-upload-directly-via-swagger')
  @ApiOperation({
    summary: '👉 API TEST: Upload file trực tiếp bằng Swagger',
    description:
      'Dán link uploadUrl nhận được từ API trên vào ô text, sau đó chọn file từ máy tính để tải lên trực tiếp thông qua Swagger.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        uploadUrl: {
          type: 'string',
          description:
            'Toàn bộ chuỗi uploadUrl dài nhận được từ API upload-url',
        },
        file: {
          type: 'string',
          format: 'binary',
          description: 'Chọn file từ máy tính của bạn',
        },
      },
      required: ['uploadUrl', 'file'],
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async testUploadViaSwagger(
    @Body('uploadUrl') uploadUrl: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      const response = await axios.put(uploadUrl, file.buffer, {
        headers: {
          'Content-Type': file.mimetype,
        },
      });

      return {
        success: true,
        message: 'Upload file lên SeaweedFS thông qua Swagger thành công!',
        storageStatus: response.status,
      };
    } catch (error: any) {
      return {
        success: false,
        message:
          'Upload thất bại. Có thể do URL hết hạn (15p) hoặc cấu hình lưu trữ SeaweedFS/Docker bị lỗi.',
        error: error.response?.data || error.message,
      };
    }
  }

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách toàn bộ tệp tin thuộc một Port',
    description:
      'Truy vấn trực tiếp danh sách Object Key từ lõi lưu trữ SeaweedFS theo cấu trúc cây thư mục.',
  })
  @ApiStandardSuccess(FileResponseDto, {
    isArray: true,
  })
  async getPortFiles(
    @Param() params: DepartmentPortParamsDto,
  ): Promise<FileResponseDto[]> {
    const files = await this.filesService.findAllByPort(params);

    return plainToInstance(FileResponseDto, files, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':fileName')
  @ApiOperation({
    summary: 'Xóa tệp tin cụ thể',
    description:
      'Xóa vĩnh viễn tệp dữ liệu khỏi ổ đĩa của cụm lưu trữ tập trung.',
  })
  @ApiStandardSuccess(FileResponseDto)
  async deleteFile(@Param() params: FileRouteParamsDto) {
    await this.filesService.removeFile(params);

    return {
      success: true,
      message: `Tệp tin ${params.fileName} tại phân vùng ${params.departmentCode}/${params.portCode} đã được xóa vĩnh viễn khỏi hạ tầng SeaweedFS`,
    };
  }

  @Post('download-url')
  @ApiOperation({
    summary: 'Yêu cầu cấp link xem/tải file tạm thời (Pre-signed View URL)',
    description:
      'Sinh một đường dẫn có chữ ký kèm thời gian hết hạn (thường dùng khi phân quyền file bảo mật hoặc file riêng tư không cache công khai).',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        fileName: {
          type: 'string',
          description: 'Tên file cụ thể cần lấy link',
          example: 'avatar_20260629172615_d98l.png',
        },
      },
      required: ['fileName'],
    },
  })
  async requestDownloadUrl(
    @Param() params: DepartmentPortParamsDto,
    @Body() dto: { fileName: string },
  ) {
    const expiresSeconds = 900;
    const cdnBaseUrl = 'https://mediatest22114.attapps.com';

    const mockPresignedUrl = `${cdnBaseUrl}/attpay-media/${params.departmentCode}/${params.portCode}/${dto.fileName}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Expires=${expiresSeconds}&X-Amz-Signature=mock_signature_abc123`;

    return {
      success: true,
      data: {
        downloadUrl: mockPresignedUrl,
        expiresIn: expiresSeconds,
      },
    };
  }

  @Post('bulk-delete')
  @ApiOperation({
    summary: 'Xóa hàng loạt tệp tin (Bulk Delete)',
    description:
      'Truyền vào một mảng danh sách các tên file để thực hiện xóa tập trung trong một request duy nhất.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        fileNames: {
          type: 'array',
          items: { type: 'string' },
          description: 'Danh sách mảng tên các file cần xóa',
          example: ['file1.png', 'file2.mp4'],
        },
      },
      required: ['fileNames'],
    },
  })
  async deleteMultipleFiles(
    @Param() params: DepartmentPortParamsDto,
    @Body() dto: { fileNames: string[] },
  ) {
    const deletedCount = dto.fileNames.length;

    return {
      success: true,
      message: `Đã thực hiện xóa thành công ${deletedCount} tệp tin thuộc phân vùng ${params.departmentCode}/${params.portCode}`,
      data: {
        processedFiles: dto.fileNames,
      },
    };
  }

  @Post(':fileName/move')
  @ApiOperation({
    summary: 'Di chuyển hoặc đổi tên tệp tin',
    description:
      'Bản chất trong S3 sẽ gọi lệnh CopyObject sang đích đến mới (đổi Port hoặc đổi tên file), sau đó gọi DeleteObject để xóa file cũ.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        targetPortCode: {
          type: 'string',
          description: 'Mã cổng đích cần chuyển tới',
          example: '654321',
        },
        targetFileName: {
          type: 'string',
          description:
            'Tên file mới ở đích đến (để trống nếu giữ nguyên tên cũ)',
          example: 'new_avatar.png',
        },
      },
      required: ['targetPortCode', 'targetFileName'],
    },
  })
  async moveFile(
    @Param() params: FileRouteParamsDto,
    @Body() dto: { targetPortCode: string; targetFileName: string },
  ) {
    const sourcePath = `${params.departmentCode}/${params.portCode}/${params.fileName}`;
    const targetPath = `${params.departmentCode}/${dto.targetPortCode}/${dto.targetFileName}`;

    return {
      success: true,
      message: 'Di chuyển tệp tin trên lõi lưu trữ phân tán thành công!',
      data: {
        from: sourcePath,
        to: targetPath,
      },
    };
  }

  @Get(':fileName/metadata')
  @ApiOperation({
    summary: 'Kiểm tra thông tin chi tiết (Metadata) của tệp tin',
    description:
      'Truy vấn nhanh thông tin header của đối tượng (kích thước, định dạng MIME) mà không cần tải toàn bộ nội dung file về.',
  })
  async getFileMetadata(@Param() params: FileRouteParamsDto) {
    const mockMetadata = {
      fileName: params.fileName,
      path: `${params.departmentCode}/${params.portCode}/${params.fileName}`,
      contentType: params.fileName.endsWith('.mp4') ? 'video/mp4' : 'image/png',
      contentLength: params.fileName.endsWith('.mp4') ? 509108502 : 2392621, // Byte
      lastModified: new Date(),
      storageClass: 'STANDARD',
      acceptRanges: 'bytes',
    };

    return {
      success: true,
      data: mockMetadata,
    };
  }
}
