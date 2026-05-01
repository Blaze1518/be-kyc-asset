import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  ClassSerializerInterceptor,
  Query,
} from '@nestjs/common';
import { AttributeService } from './attribute.service';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';
import { QueryAttributeDto } from './dto/query-attribute.dto';
import { ApiStandardError } from 'src/common/decorators/swagger/errors.decorator';
import { ApiStandardSuccess } from 'src/common/decorators/swagger/success.decorator';
import { plainToInstance } from 'class-transformer';
import { ResponseAttributeDto } from './dto/response-attribute.dto';
import { ParamsWithIdDto } from 'src/common/dto/param-id.dto';

@ApiTags('Attribute (Quản lý thuộc tính/điều kiện)')
@ApiBearerAuth()
@Controller('attribute')
@UseInterceptors(ClassSerializerInterceptor)
@ApiStandardError(undefined, '/attribute')
export class AttributeController {
  constructor(private readonly attributeService: AttributeService) {}

  @Post()
  @ApiOperation({
    summary: 'Tạo điều kiện quyền mới',
    description:
      'Chỉ dành cho tài khoản có quyền Admin. Dùng để định nghĩa các thuộc tính mở rộng cho phân quyền.',
  })
  @ApiStandardSuccess(ResponseAttributeDto, { status: HttpStatus.CREATED })
  async create(
    @Body() createAttributeDto: CreateAttributeDto,
  ): Promise<ResponseAttributeDto> {
    const result = await this.attributeService.create(createAttributeDto);
    return plainToInstance(ResponseAttributeDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách điều kiện quyền (phân trang)',
    description: 'Hỗ trợ lọc theo tên, sắp xếp và phân trang.',
  })
  @ApiStandardSuccess(ResponseAttributeDto, {
    isArray: true,
    isPaginated: true,
  })
  findAllPaginated(@Query() query: QueryAttributeDto) {
    return this.attributeService.findAllPaginated(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết một điều kiện quyền' })
  @ApiStandardSuccess(ResponseAttributeDto)
  async findOne(
    @Param() params: ParamsWithIdDto,
  ): Promise<ResponseAttributeDto> {
    const result = await this.attributeService.findOne(params.id);
    return plainToInstance(ResponseAttributeDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật điều kiện quyền' })
  @ApiStandardSuccess(ResponseAttributeDto)
  async update(
    @Param() params: ParamsWithIdDto,
    @Body() updateAttributeDto: UpdateAttributeDto,
  ): Promise<ResponseAttributeDto> {
    const result = await this.attributeService.update(
      params.id,
      updateAttributeDto,
    );
    return plainToInstance(ResponseAttributeDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa điều kiện quyền' })
  @ApiStandardSuccess(ResponseAttributeDto)
  async remove(
    @Param() params: ParamsWithIdDto,
  ): Promise<ResponseAttributeDto> {
    const result = await this.attributeService.remove(params.id);
    return plainToInstance(ResponseAttributeDto, result, {
      excludeExtraneousValues: true,
    });
  }
}
