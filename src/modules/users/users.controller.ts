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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiStandardError } from 'src/common/decorators/swagger/errors.decorator';
import { ApiStandardSuccess } from 'src/common/decorators/swagger/success.decorator';
import { QueryDto } from 'src/common/dto/query.dto';
import { ParamsWithIdDto } from 'src/common/dto/param-id.dto';
import { ResponseUserDto } from './dto/response-user.dto';
import { plainToInstance } from 'class-transformer';

@ApiTags('Users (Quản lý người dùng)')
@ApiBearerAuth()
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
@ApiStandardError(undefined, '/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({
    summary: 'Tạo tài khoản mới',
    description: 'Tạo user mới, hash password và gán vai trò nếu có.',
  })
  @ApiStandardSuccess(ResponseUserDto, {
    status: HttpStatus.CREATED,
  })
  async create(@Body() createUserDto: CreateUserDto): Promise<ResponseUserDto> {
    const result = await this.usersService.create(createUserDto);
    return plainToInstance(ResponseUserDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách người dùng (phân trang)',
    description: 'Hỗ trợ lọc theo username/displayName, sắp xếp và phân trang.',
  })
  @ApiStandardSuccess(ResponseUserDto, {
    isArray: true,
    isPaginated: true,
  })
  findAll(@Query() query: QueryDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết một người dùng' })
  @ApiStandardSuccess(ResponseUserDto)
  async findOne(@Param() params: ParamsWithIdDto): Promise<ResponseUserDto> {
    const result = await this.usersService.findOne(params.id);
    return plainToInstance(ResponseUserDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật người dùng' })
  @ApiStandardSuccess(ResponseUserDto)
  async update(
    @Param() params: ParamsWithIdDto,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<ResponseUserDto> {
    const result = await this.usersService.update(params.id, updateUserDto);
    return plainToInstance(ResponseUserDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa mềm người dùng' })
  @ApiStandardSuccess(ResponseUserDto)
  async remove(@Param() params: ParamsWithIdDto): Promise<ResponseUserDto> {
    const result = await this.usersService.remove(params.id);
    return plainToInstance(ResponseUserDto, result, {
      excludeExtraneousValues: true,
    });
  }
}
