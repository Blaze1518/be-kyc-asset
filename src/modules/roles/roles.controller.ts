import {
  ApiBearerAuth,
  ApiOperation,
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
  UseInterceptors,
  ClassSerializerInterceptor,
  Query,
  HttpStatus,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ApiStandardError } from 'src/common/decorators/swagger/errors.decorator';
import { ApiStandardSuccess } from 'src/common/decorators/swagger/success.decorator';
import { QueryDto } from 'src/common/dto/query.dto';
import { ParamsWithIdDto } from 'src/common/dto/param-id.dto';
import { RoleWithPermissionsDto } from './dto/role-permissions.dto';
import { plainToInstance } from 'class-transformer';

@ApiTags('Roles (Quản lý vai trò)')
@ApiBearerAuth()
@Controller('roles')
@UseInterceptors(ClassSerializerInterceptor)
@ApiStandardError(undefined, '/roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @ApiOperation({
    summary: 'Tạo vai trò mới',
    description:
      'Tạo vai trò và gán danh sách quyền trực tiếp cho vai trò trong cùng transaction.',
  })
  @ApiStandardSuccess(RoleWithPermissionsDto, {
    status: HttpStatus.CREATED,
  })
  async create(
    @Body() createRoleDto: CreateRoleDto,
  ): Promise<RoleWithPermissionsDto> {
    const result = await this.rolesService.create(createRoleDto);
    return plainToInstance(RoleWithPermissionsDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách vai trò (phân trang)',
    description: 'Hỗ trợ lọc theo tên, sắp xếp và phân trang.',
  })
  @ApiStandardSuccess(RoleWithPermissionsDto, {
    isArray: true,
    isPaginated: true,
  })
  findAll(@Query() query: QueryDto) {
    return this.rolesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết một vai trò' })
  @ApiStandardSuccess(RoleWithPermissionsDto)
  async findOne(@Param() params: ParamsWithIdDto) {
    const result = await this.rolesService.findOne(params.id);
    return plainToInstance(RoleWithPermissionsDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật vai trò' })
  @ApiStandardSuccess(RoleWithPermissionsDto)
  async update(
    @Param() params: ParamsWithIdDto,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    const result = await this.rolesService.update(params.id, updateRoleDto);
    return plainToInstance(RoleWithPermissionsDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa vai trò' })
  @ApiStandardSuccess(RoleWithPermissionsDto)
  async remove(@Param() params: ParamsWithIdDto) {
    const result = await this.rolesService.remove(params.id);
    return plainToInstance(RoleWithPermissionsDto, result, {
      excludeExtraneousValues: true,
    });
  }
}
