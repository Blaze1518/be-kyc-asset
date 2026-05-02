import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  ClassSerializerInterceptor,
  HttpStatus,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { ParamsWithIdDto } from 'src/common/dto/param-id.dto';
import { QueryDto } from 'src/common/dto/query.dto';
import { ApiStandardError } from 'src/common/decorators/swagger/errors.decorator';
import { ApiStandardSuccess } from 'src/common/decorators/swagger/success.decorator';
import { ResponsePermissionConditionDto } from './dto/response-permission.dto';
import { plainToInstance } from 'class-transformer';

@ApiTags('Permissions (Quản lý quyền)')
@ApiBearerAuth()
@Controller('permissions')
@UseInterceptors(ClassSerializerInterceptor)
@ApiStandardError(undefined, '/permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @ApiOperation({
    summary: 'Tạo quyền mới',
    description:
      'Chỉ dành cho tài khoản có quyền Admin. Dùng để định nghĩa các quyền cho hệ thống.',
  })
  @ApiStandardSuccess(ResponsePermissionConditionDto, {
    status: HttpStatus.CREATED,
  })
  async create(
    @Body() createPermissionDto: CreatePermissionDto,
  ): Promise<ResponsePermissionConditionDto> {
    const result =
      await this.permissionsService.createPermission(createPermissionDto);
    return plainToInstance(ResponsePermissionConditionDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách quyền (phân trang)',
    description: 'Hỗ trợ lọc theo tên, sắp xếp và phân trang.',
  })
  @ApiStandardSuccess(ResponsePermissionConditionDto, {
    isArray: true,
    isPaginated: true,
  })
  findAllPaginated(@Query() query: QueryDto) {
    return this.permissionsService.findAllPaginated(query);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật quyền' })
  @ApiStandardSuccess(ResponsePermissionConditionDto)
  async update(
    @Param() params: ParamsWithIdDto,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ): Promise<ResponsePermissionConditionDto> {
    const result = await this.permissionsService.updatePermission(
      params.id,
      updatePermissionDto,
    );
    return plainToInstance(ResponsePermissionConditionDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa quyền' })
  @ApiStandardSuccess(ResponsePermissionConditionDto)
  async remove(
    @Param() params: ParamsWithIdDto,
  ): Promise<ResponsePermissionConditionDto> {
    const result = await this.permissionsService.deletePermission(params.id);
    return plainToInstance(ResponsePermissionConditionDto, result, {
      excludeExtraneousValues: true,
    });
  }
}
