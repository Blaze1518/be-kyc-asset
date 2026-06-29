import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
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
  HttpStatus,
} from '@nestjs/common';
import { PortsService } from './ports.service';
import { CreatePortDto } from './dto/create-port.dto';
import { UpdatePortDto } from './dto/update-port.dto'; // Thường kế thừa PartialType(CreatePortDto)
import { ApiStandardError } from 'src/common/decorators/swagger/errors.decorator';
import { ApiStandardSuccess } from 'src/common/decorators/swagger/success.decorator';
import { QueryDto } from 'src/common/dto/query.dto';
import { ParamsWithIdDto } from 'src/common/dto/param-id.dto';
import { PortResponseDto } from './dto/port-response.dto';
import { plainToInstance } from 'class-transformer';

@ApiTags('Ports (Quản lý Cổng / Nhân viên)')
@ApiBearerAuth()
@Controller('ports')
@UseInterceptors(ClassSerializerInterceptor)
@ApiStandardError(undefined, '/ports')
export class PortsController {
  constructor(private readonly portsService: PortsService) {}

  @Post()
  @ApiOperation({
    summary: 'Tạo cổng (nhân viên) mới',
    description:
      'Tạo mới một cổng trực thuộc phòng ban. Hệ thống kiểm tra trùng lặp mã cổng trên toàn hệ thống.',
  })
  @ApiStandardSuccess(PortResponseDto, {
    status: HttpStatus.CREATED,
  })
  async create(@Body() createPortDto: CreatePortDto): Promise<PortResponseDto> {
    const port = await this.portsService.create(createPortDto);

    return plainToInstance(PortResponseDto, port, {
      excludeExtraneousValues: true,
    });
  }

  // @Get()
  // @ApiOperation({
  //   summary: 'Lấy danh sách cổng (phân trang)',
  //   description: 'Hỗ trợ tìm kiếm theo mã cổng, sắp xếp và phân trang.',
  // })
  // @ApiStandardSuccess(PortResponseDto, {
  //   isArray: true,
  //   isPaginated: true,
  // })
  // findAll(@Query() query: QueryDto) {
  //   return this.portsService.findAll(query);
  // }

  // @Get(':id')
  // @ApiOperation({ summary: 'Lấy chi tiết một cổng qua ID' })
  // @ApiStandardSuccess(PortResponseDto)
  // async findOne(@Param() params: ParamsWithIdDto) {
  //   const result = await this.portsService.findOne(params.id);
  //   return plainToInstance(PortResponseDto, result, {
  //     excludeExtraneousValues: true,
  //   });
  // }

  // @Patch(':id')
  // @ApiOperation({ summary: 'Cập nhật thông tin cổng' })
  // @ApiStandardSuccess(PortResponseDto)
  // async update(
  //   @Param() params: ParamsWithIdDto,
  //   @Body() updatePortDto: UpdatePortDto,
  // ) {
  //   const result = await this.portsService.update(params.id, updatePortDto);
  //   return plainToInstance(PortResponseDto, result, {
  //     excludeExtraneousValues: true,
  //   });
  // }

  // @Delete(':id')
  // @ApiOperation({ summary: 'Xóa cổng khỏi hệ thống' })
  // @ApiStandardSuccess(PortResponseDto)
  // async remove(@Param() params: ParamsWithIdDto) {
  //   const result = await this.portsService.remove(params.id);
  //   return plainToInstance(PortResponseDto, result, {
  //     excludeExtraneousValues: true,
  //   });
  // }
}
