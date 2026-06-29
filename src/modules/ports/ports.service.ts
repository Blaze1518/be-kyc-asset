import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { QueryDto } from 'src/common/dto/query.dto';
import { CreatePortDto } from './dto/create-port.dto';
import { UpdatePortDto } from './dto/update-port.dto';
import { PortResponseDto } from './dto/port-response.dto';
import { PortsRepository } from './repositories/ports.repository';
import { DepartmentsService } from '../departments/departments.service';
export interface FindPortsQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

@Injectable()
export class PortsService {
  constructor(
    private readonly portsRepository: PortsRepository,
    private readonly departmentsService: DepartmentsService,
  ) {}

  async create(createPortDto: CreatePortDto) {
    const { code, codeDepartment } = createPortDto;

    const department = await this.departmentsService.findByCode(codeDepartment);
    if (!department) {
      throw new NotFoundException(
        `Phòng ban (Site) với mã #${codeDepartment} không tồn tại hoặc đã bị xóa`,
      );
    }

    return this.portsRepository.create({
      data: {
        port_code: code,
        department_id: department.id,
      },
    });
  }

  async validatePortBelongsToDepartment(
    departmentCode: string,
    portCode: string,
  ): Promise<boolean> {
    const port = await this.portsRepository.findByCode(portCode);
    if (!port) {
      return false;
    }

    const department = await this.departmentsService.findByCode(departmentCode);
    if (!department) {
      return false;
    }

    if (port.department_id != department.id) {
      return false;
    }

    return true;
  }
}
