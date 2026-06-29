import { Injectable } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { IDatabaseContext } from 'src/common/database/interface/db-context.interface';
import { PrismaRepository } from 'src/prisma/prisma.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { handlePrismaError } from 'src/prisma/prisma-error-handler';

export interface FindPortsQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

@Injectable()
export class PortsRepository extends PrismaRepository<'Port'> {
  constructor(prisma: PrismaService) {
    super(prisma, 'port');
  }

  /**
   * Tìm kiếm Port và nạp kèm thông tin phòng ban trực thuộc
   * Lưu ý: Schema của bạn không có trường deletedAt cho Port, tìm trực tiếp theo ID
   */
  async findActiveById(id: string, ctx?: IDatabaseContext) {
    return this.findFirst(
      {
        where: { id },
        include: { department: true }, // Gộp thông tin phòng ban
      },
      ctx,
    );
  }

  /**
   * Nghiệp vụ 4.2: Tìm kiếm Port theo mã port_code thực tế trong Schema để check trùng
   */
  async findByCode(portCode: string, ctx?: IDatabaseContext) {
    return this.findFirst(
      {
        where: { port_code: portCode },
        include: { department: true },
      },
      ctx,
    );
  }

  /**
   * Xoá mềm Port khỏi hệ thống
   * (Nếu Schema của bạn chưa thêm cột deletedAt, hàm này tạm thời dùng để clear hoặc bạn bổ sung sau)
   */
  // async softDelete(id: string, ctx?: IDatabaseContext) {
  //   return this.update(
  //     { where: { id }, data: { deletedAt: new Date() } },
  //     ctx,
  //   );
  // }

  /**
   * Lấy danh sách Port phân trang kèm tìm kiếm theo trường port_code trong Schema
   */
  // async findManyPaginated(
  //   query: FindPortsQuery,
  //   ctx?: IDatabaseContext,
  // ): Promise<[Prisma.PortCreateInput[], number]> { // Hoặc dùng kiểu dữ liệu thực thể Port của bạn
  //   try {
  //     const page = Number(query.page) || 1;
  //     const limit = Number(query.limit) || 10;
  //     const skip = (page - 1) * limit;

  //     // Sắp xếp mặc định theo trường snake_case trong schema: created_at
  //     const orderBy = query.sortBy
  //       ? { [query.sortBy]: query.sortOrder ?? 'asc' }
  //       : { createdAt: 'desc' };

  //     const where: Prisma.PortWhereInput = {};

  //     if (query.search) {
  //       where.OR = [
  //         // Khớp chính xác với trường port_code trong Schema của bạn
  //         { port_code: { contains: query.search, mode: 'insensitive' } },
  //       ];
  //     }

  //     const model = this.getModel(ctx);
  //     const operations = [
  //       model.findMany({
  //         where,
  //         skip,
  //         take: limit,
  //         orderBy,
  //         include: { department: true } // Lấy thông tin quan hệ phục vụ map DTO
  //       }),
  //       model.count({ where }),
  //     ];

  //     return ctx
  //       ? (Promise.all(operations) as unknown as Promise<[Prisma.PortCreateInput[], number]>)
  //       : (this.prisma.$transaction(operations) as unknown as Promise<[Prisma.PortCreateInput[], number]>);
  //   } catch (error) {
  //     return handlePrismaError(error, 'port');
  //   }
  // }
}
