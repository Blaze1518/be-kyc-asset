import { applyDecorators, HttpStatus } from '@nestjs/common';
import { getReasonPhrase } from 'http-status-codes';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { ErrorResponseDto } from 'src/common/dto/error-response.dto';
import { v4 as uuidv4 } from 'uuid';

const errorSchema = (status: number, message: string, path?: string) => ({
  allOf: [{ $ref: getSchemaPath(ErrorResponseDto) }],
  example: {
    success: false,
    error: {
      statusCode: status,
      message: message,
      requestId: uuidv4(),
      timestamp: new Date().toISOString(),
      path: path,
    },
  },
});

export function ApiStandardError(
  customMessages?: { [key: number]: string },
  contextPath?: string,
) {
  const commonErrors = [
    HttpStatus.BAD_REQUEST,
    HttpStatus.NOT_FOUND,
    HttpStatus.CONFLICT,
    HttpStatus.INTERNAL_SERVER_ERROR,
  ];

  return applyDecorators(
    ApiExtraModels(ErrorResponseDto),
    ...commonErrors.map((status) =>
      ApiResponse({
        status,
        description: getReasonPhrase(status),
        schema: errorSchema(
          status,
          customMessages?.[status] || getReasonPhrase(status),
          contextPath,
        ),
      }),
    ),
  );
}
