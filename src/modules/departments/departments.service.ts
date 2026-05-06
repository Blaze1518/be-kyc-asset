import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Prisma } from 'src/generated/prisma/client';
import { QueryDto } from 'src/common/dto/query.dto';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { ResponseDepartmentDto } from './dto/response-department.dto';
import { DepartmentsRepository } from './repositories/departments.repository';

@Injectable()
export class DepartmentsService {
  constructor(private readonly departmentsRepository: DepartmentsRepository) {}

  private async findDepartmentOrThrow(id: string) {
    const department = await this.departmentsRepository.findFirst({
      where: { id, deletedAt: null },
    });

    if (!department) {
      throw new NotFoundException(`Đơn vị với ID #${id} không tồn tại`);
    }

    return department;
  }

  async create(createDepartmentDto: CreateDepartmentDto) {
    return await this.departmentsRepository.create({
      data: createDepartmentDto,
    });
  }

  async findAll(query: QueryDto) {
    const { search, page = 1, limit = 10, ...paginationParams } = query;

    const where: Prisma.DepartmentWhereInput = {};
    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await this.departmentsRepository.findManyPaginated(
      { page, limit, ...paginationParams },
      where,
    );

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
    return await this.findDepartmentOrThrow(id);
  }

  async update(id: string, updateDepartmentDto: UpdateDepartmentDto) {
    await this.findDepartmentOrThrow(id);

    return await this.departmentsRepository.update({
      where: { id },
      data: updateDepartmentDto,
    });
  }

  async remove(id: string) {
    await this.findDepartmentOrThrow(id);

    return await this.departmentsRepository.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
