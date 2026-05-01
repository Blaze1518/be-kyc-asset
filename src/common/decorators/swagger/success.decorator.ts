import { applyDecorators, HttpStatus, Type } from '@nestjs/common';
import { getReasonPhrase } from 'http-status-codes';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';

export function ApiStandardSuccess<TModel extends Type<any>>(
  model?: TModel,
  options: {
    isArray?: boolean;
    status?: HttpStatus;
    isPaginated?: boolean;
  } = {},
) {
  const {
    isArray = false,
    status = HttpStatus.OK,
    isPaginated = false,
  } = options;
  const modelsToInclude = model ? [model] : [];
  let dataSchema: any;
  if (isPaginated && model) {
    dataSchema = {
      type: 'object',
      properties: {
        items: { type: 'array', items: { $ref: getSchemaPath(model) } },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            page: { type: 'number' },
            limit: { type: 'number' },
            totalPages: { type: 'number' },
          },
        },
      },
    };
  } else {
    dataSchema = model
      ? isArray
        ? { type: 'array', items: { $ref: getSchemaPath(model) } }
        : { $ref: getSchemaPath(model) }
      : { type: 'object', nullable: true };
  }

  return applyDecorators(
    ApiExtraModels(...modelsToInclude),
    ApiResponse({
      status: status,
      description: getReasonPhrase(status),
      schema: {
        properties: {
          success: { type: 'boolean', default: true },
          data: dataSchema,
        },
      },
    }),
  );
}
