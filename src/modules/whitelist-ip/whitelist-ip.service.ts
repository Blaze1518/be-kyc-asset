import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateWhitelistIpDto } from './dto/create-whitelist-ip.dto';
import { UpdateWhitelistIpDto } from './dto/update-whitelist-ip.dto';
import { WhitelistIpRepository } from './repositories/whitelist-ip.repository';
import { QueryDto } from 'src/common/dto/query.dto';
import { plainToInstance } from 'class-transformer';
import { ResponseWhitelistIpDto } from './dto/response-whitelist-ip.dto';

@Injectable()
export class WhitelistIpService {
  constructor(private readonly whitelistIpRepository: WhitelistIpRepository) {}

  private toResponse(data: unknown): ResponseWhitelistIpDto {
    return plainToInstance(ResponseWhitelistIpDto, data, {
      excludeExtraneousValues: true,
    });
  }

  private async findWhitelistIpOrThrow(id: string) {
    const whitelistIp = await this.whitelistIpRepository.findUnique({
      where: { id },
    });

    if (!whitelistIp) {
      throw new NotFoundException(`Whitelist IP với ID #${id} không tồn tại`);
    }

    return whitelistIp;
  }

  async create(createWhitelistIpDto: CreateWhitelistIpDto) {
    const whitelistIp = await this.whitelistIpRepository.create({
      data: createWhitelistIpDto,
    });

    return this.toResponse(whitelistIp);
  }

  async findAll(query: QueryDto) {
    const { search, page = 1, limit = 10, ...paginationParams } = query;
    let where = {};

    if (search) {
      where = {
        OR: [
          { address: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const [items, total] = await this.whitelistIpRepository.findManyPaginated(
      { page, limit, ...paginationParams },
      where,
    );

    return {
      items: items.map((item) => this.toResponse(item)),
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const whitelistIp = await this.findWhitelistIpOrThrow(id);
    return this.toResponse(whitelistIp);
  }

  async update(id: string, updateWhitelistIpDto: UpdateWhitelistIpDto) {
    await this.findWhitelistIpOrThrow(id);

    const whitelistIp = await this.whitelistIpRepository.update({
      where: { id },
      data: updateWhitelistIpDto,
    });

    return this.toResponse(whitelistIp);
  }

  async remove(id: string) {
    await this.findWhitelistIpOrThrow(id);

    const whitelistIp = await this.whitelistIpRepository.delete({
      where: { id },
    });

    return this.toResponse(whitelistIp);
  }
}
