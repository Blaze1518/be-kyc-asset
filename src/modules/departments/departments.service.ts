import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { QueryDto } from 'src/common/dto/query.dto';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { ResponseDepartmentDto } from './dto/response-department.dto';
import { DepartmentsRepository } from './repositories/departments.repository';

@Injectable()
export class DepartmentsService {
  constructor(private readonly departmentsRepository: DepartmentsRepository) {}

  async findByCode(code: string) {
    const department = await this.departmentsRepository.findUnique({
      where: { code },
    });

    if (!department || department.deletedAt !== null) {
      return null;
    }

    return department;
  }

  private async findDepartmentOrThrow(id: string) {
    const department = await this.departmentsRepository.findActiveById(id);

    if (!department) {
      throw new NotFoundException(`Đơn vị với ID #${id} không tồn tại`);
    }

    return department;
  }

  async create(createDepartmentDto: CreateDepartmentDto) {
    return this.departmentsRepository.create({
      data: createDepartmentDto,
    });
  }

  async findAll(query: QueryDto) {
    const { page = 1, limit = 10 } = query;

    const [items, total] = await this.departmentsRepository.findManyPaginated({
      ...query,
      page,
      limit,
    });

    return {
      items: plainToInstance(ResponseDepartmentDto, items, {
        excludeExtraneousValues: true,
      }),
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    return this.findDepartmentOrThrow(id);
  }

  async update(id: string, updateDepartmentDto: UpdateDepartmentDto) {
    await this.findDepartmentOrThrow(id);

    return this.departmentsRepository.update({
      where: { id },
      data: updateDepartmentDto,
    });
  }

  async remove(id: string) {
    await this.findDepartmentOrThrow(id);

    return this.departmentsRepository.softDelete(id);
  }
}
