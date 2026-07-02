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
    return {
      success: true,
      message: `Yêu cầu xóa tệp ${params.fileName} tại phân vùng ${params.departmentCode}/${params.portCode} đã được ghi nhận`,
    };
  }
}
