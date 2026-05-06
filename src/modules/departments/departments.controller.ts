import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { ApiStandardError } from 'src/common/decorators/swagger/errors.decorator';
import { ApiStandardSuccess } from 'src/common/decorators/swagger/success.decorator';
import { ParamsWithIdDto } from 'src/common/dto/param-id.dto';
import { QueryDto } from 'src/common/dto/query.dto';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { ResponseDepartmentDto } from './dto/response-department.dto';

@ApiTags('Departments (Quản lý đơn vị)')
@ApiBearerAuth()
@Controller('departments')
@UseInterceptors(ClassSerializerInterceptor)
@ApiStandardError(undefined, '/departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @ApiOperation({
    summary: 'Tạo đơn vị mới',
    description: 'Thêm một đơn vị mới với mã định danh duy nhất.',
  })
  @ApiStandardSuccess(ResponseDepartmentDto, { status: HttpStatus.CREATED })
  async create(
    @Body() createDepartmentDto: CreateDepartmentDto,
  ): Promise<ResponseDepartmentDto> {
    const result = await this.departmentsService.create(createDepartmentDto);
    return plainToInstance(ResponseDepartmentDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách đơn vị (phân trang)',
    description: 'Hỗ trợ tìm kiếm theo mã hoặc tên đơn vị, sắp xếp và phân trang.',
  })
  @ApiStandardSuccess(ResponseDepartmentDto, {
    isArray: true,
    isPaginated: true,
  })
  findAll(@Query() query: QueryDto) {
    return this.departmentsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết một đơn vị' })
  @ApiStandardSuccess(ResponseDepartmentDto)
  async findOne(
    @Param() params: ParamsWithIdDto,
  ): Promise<ResponseDepartmentDto> {
    const result = await this.departmentsService.findOne(params.id);
    return plainToInstance(ResponseDepartmentDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật đơn vị' })
  @ApiStandardSuccess(ResponseDepartmentDto)
  async update(
    @Param() params: ParamsWithIdDto,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ): Promise<ResponseDepartmentDto> {
    const result = await this.departmentsService.update(
      params.id,
      updateDepartmentDto,
    );
    return plainToInstance(ResponseDepartmentDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Xóa đơn vị (soft delete)',
    description: 'Đặt cờ deletedAt thay vì xóa vật lý để bảo toàn dữ liệu liên quan.',
  })
  @ApiStandardSuccess(ResponseDepartmentDto)
  async remove(
    @Param() params: ParamsWithIdDto,
  ): Promise<ResponseDepartmentDto> {
    const result = await this.departmentsService.remove(params.id);
    return plainToInstance(ResponseDepartmentDto, result, {
      excludeExtraneousValues: true,
    });
  }
}
