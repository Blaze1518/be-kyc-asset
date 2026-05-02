import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';
import { AttributesRepository } from './repositories/attributes.repository';
import { QueryAttributeDto } from './dto/query-attribute.dto';
import { plainToInstance } from 'class-transformer';
import { ResponseAttributeDto } from './dto/response-attribute.dto';

@Injectable()
export class AttributeService {
  constructor(private readonly attributesRepository: AttributesRepository) {}
  create(createAttributeDto: CreateAttributeDto) {
    return this.attributesRepository.create({ data: createAttributeDto });
  }

  async findAllPaginated(query: QueryAttributeDto) {
    const { search, page = 1, limit = 10, ...paginationParams } = query;

    let where = {};
    if (search) {
      where = {
        OR: [{ name: { contains: search, mode: 'insensitive' } }],
      };
    }

    const [items, total] = await this.attributesRepository.findManyPaginated(
      paginationParams,
      where,
    );

    return {
      items: plainToInstance(ResponseAttributeDto, items, {
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

  async findAll() {
    return await this.attributesRepository.findMany();
  }

  async findOne(id: string) {
    return await this.attributesRepository.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateAttributeDto: UpdateAttributeDto) {
    return await this.attributesRepository.update({
      where: { id },
      data: updateAttributeDto,
    });
  }

  async remove(id: string) {
    return await this.attributesRepository.delete({
      where: { id },
    });
  }
}
