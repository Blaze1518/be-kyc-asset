import { Prisma } from 'src/generated/prisma/client';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaFieldMap, PrismaModelMap } from './constants/prisma-error-map';
import { PrismaErrorMessages } from './constants/prisma-messages.vi';

export const handlePrismaError = (error: any, modelName?: string) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const model =
      PrismaModelMap[modelName as keyof typeof PrismaModelMap] ||
      modelName ||
      'Dữ liệu';

    const meta = error.meta as any;

    switch (error.code) {
      case 'P2000': {
        const column = meta?.column_name || 'không xác định';
        throw new BadRequestException(PrismaErrorMessages.P2000(column));
      }

      case 'P2001': {
        const field = meta?.argument_name || 'không xác định';
        const value = meta?.argument_value || 'không xác định';
        throw new NotFoundException(
          PrismaErrorMessages.P2001(model, field, value),
        );
      }

      case 'P2002': {
        let targetFields = meta?.target as string[] | undefined;

        if (!targetFields || targetFields.length === 0) {
          const driverError =
            meta?.driverAdapterError?.cause?.constraint?.fields;
          if (Array.isArray(driverError)) {
            targetFields = driverError.map((f: string) => f.replace(/"/g, ''));
          }
        }

        const fields =
          targetFields?.map((f) => PrismaFieldMap[f] || f).join(', ') ||
          'không xác định';

        throw new ConflictException(PrismaErrorMessages.P2002(fields, model));
      }

      case 'P2003': {
        const field = (meta?.field_name as string) || 'không xác định';
        throw new BadRequestException(PrismaErrorMessages.P2003(field));
      }

      case 'P2004': {
        const detail = meta?.database_error || 'không xác định';
        throw new BadRequestException(PrismaErrorMessages.P2004(detail));
      }

      case 'P2005': {
        const field = meta?.field_name || 'không xác định';
        const value = meta?.field_value || 'không xác định';
        throw new BadRequestException(PrismaErrorMessages.P2005(field, value));
      }

      case 'P2006': {
        const field = meta?.field_name || 'không xác định';
        const value = meta?.field_value || 'không xác định';
        throw new BadRequestException(
          PrismaErrorMessages.P2006(model, field, value),
        );
      }

      case 'P2007': {
        throw new BadRequestException(PrismaErrorMessages.P2007(model));
      }

      case 'P2011': {
        const field = meta?.constraint || 'không xác định';
        throw new BadRequestException(PrismaErrorMessages.P2011(field));
      }

      case 'P2012': {
        const path = meta?.path || 'không xác định';
        throw new BadRequestException(PrismaErrorMessages.P2012(path));
      }

      case 'P2013': {
        const arg = meta?.argument_name || 'không xác định';
        const field = meta?.field_name || 'không xác định';
        const object = meta?.object_name || 'không xác định';
        throw new BadRequestException(
          PrismaErrorMessages.P2013(arg, field, object),
        );
      }

      case 'P2014': {
        const relation = meta?.relation_name || 'không xác định';
        const modelA = meta?.model_a_name || model;
        const modelB = meta?.model_b_name || 'không xác định';
        throw new BadRequestException(
          PrismaErrorMessages.P2014(relation, modelA, modelB),
        );
      }

      case 'P2015': {
        const detail = meta?.details || 'không xác định';
        throw new NotFoundException(PrismaErrorMessages.P2015(detail));
      }

      case 'P2016': {
        const detail = meta?.details || 'không xác định';
        throw new BadRequestException(PrismaErrorMessages.P2016(detail));
      }

      case 'P2017': {
        const relation = meta?.relation_name || 'không xác định';
        const parent = meta?.parent_name || 'không xác định';
        const child = meta?.child_name || 'không xác định';
        throw new BadRequestException(
          PrismaErrorMessages.P2017(relation, parent, child),
        );
      }

      case 'P2020': {
        const detail = meta?.details || 'không xác định';
        throw new BadRequestException(PrismaErrorMessages.P2020(detail));
      }

      case 'P2024': {
        const timeout = meta?.timeout || 0;
        const limit = meta?.connection_limit || 0;
        throw new InternalServerErrorException(
          PrismaErrorMessages.P2024(timeout, limit),
        );
      }

      case 'P2025': {
        const cause = meta?.cause || PrismaErrorMessages.P2025(model);
        throw new NotFoundException(cause);
      }

      case 'P2028': {
        const err = meta?.error || 'không xác định';
        throw new InternalServerErrorException(PrismaErrorMessages.P2028(err));
      }

      case 'P2034': {
        throw new ConflictException(PrismaErrorMessages.P2034());
      }

      default:
        throw new InternalServerErrorException(
          `Lỗi Database (${error.code}): ${error.message}`,
        );
    }
  }

  if (error.status) throw error;

  throw new InternalServerErrorException('Lỗi hệ thống không xác định.');
};
