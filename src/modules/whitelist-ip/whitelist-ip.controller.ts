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
import { WhitelistIpService } from './whitelist-ip.service';
import { CreateWhitelistIpDto } from './dto/create-whitelist-ip.dto';
import { UpdateWhitelistIpDto } from './dto/update-whitelist-ip.dto';
import { ApiStandardError } from 'src/common/decorators/swagger/errors.decorator';
import { ApiStandardSuccess } from 'src/common/decorators/swagger/success.decorator';
import { QueryDto } from 'src/common/dto/query.dto';
import { ParamsWithIdDto } from 'src/common/dto/param-id.dto';
import { ResponseWhitelistIpDto } from './dto/response-whitelist-ip.dto';
import { plainToInstance } from 'class-transformer';

@ApiTags('Whitelist IP (Quản lý IP whitelist)')
@ApiBearerAuth()
@Controller('whitelist-ip')
@UseInterceptors(ClassSerializerInterceptor)
@ApiStandardError(undefined, '/whitelist-ip')
export class WhitelistIpController {
  constructor(private readonly whitelistIpService: WhitelistIpService) {}

  @Post()
  @ApiOperation({
    summary: 'Tạo IP whitelist mới',
    description: 'Thêm một địa chỉ IPv4 hoặc CIDR vào danh sách được phép.',
  })
  @ApiStandardSuccess(ResponseWhitelistIpDto, {
    status: HttpStatus.CREATED,
  })
  async create(
    @Body() createWhitelistIpDto: CreateWhitelistIpDto,
  ): Promise<ResponseWhitelistIpDto> {
    const result = await this.whitelistIpService.create(createWhitelistIpDto);
    return plainToInstance(ResponseWhitelistIpDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách IP whitelist (phân trang)',
    description: 'Hỗ trợ tìm kiếm theo địa chỉ IP hoặc mô tả.',
  })
  @ApiStandardSuccess(ResponseWhitelistIpDto, {
    isArray: true,
    isPaginated: true,
  })
  findAll(@Query() query: QueryDto) {
    return this.whitelistIpService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết một IP whitelist' })
  @ApiStandardSuccess(ResponseWhitelistIpDto)
  async findOne(
    @Param() params: ParamsWithIdDto,
  ): Promise<ResponseWhitelistIpDto> {
    const result = await this.whitelistIpService.findOne(params.id);
    return plainToInstance(ResponseWhitelistIpDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật IP whitelist' })
  @ApiStandardSuccess(ResponseWhitelistIpDto)
  async update(
    @Param() params: ParamsWithIdDto,
    @Body() updateWhitelistIpDto: UpdateWhitelistIpDto,
  ): Promise<ResponseWhitelistIpDto> {
    const result = await this.whitelistIpService.update(
      params.id,
      updateWhitelistIpDto,
    );
    return plainToInstance(ResponseWhitelistIpDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa IP whitelist' })
  @ApiStandardSuccess(ResponseWhitelistIpDto)
  async remove(
    @Param() params: ParamsWithIdDto,
  ): Promise<ResponseWhitelistIpDto> {
    const result = await this.whitelistIpService.remove(params.id);
    return plainToInstance(ResponseWhitelistIpDto, result, {
      excludeExtraneousValues: true,
    });
  }
}
