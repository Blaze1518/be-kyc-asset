import { ApiProperty } from '@nestjs/swagger';

export class ErrorDetailDto {
  @ApiProperty({ example: 409 })
  statusCode: number;

  @ApiProperty({ example: 'attribute với name này đã tồn tại.' })
  message: string | string[];

  @ApiProperty({ example: 'b4455dc9-313b-4914-8fe2-9e257abe29b8' })
  requestId: string;

  @ApiProperty({ example: '2026-04-30T11:46:33.862Z' })
  timestamp: string;

  @ApiProperty({ example: '/attribute' })
  path: string;
}

export class ErrorResponseDto {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ type: () => ErrorDetailDto })
  error: ErrorDetailDto;
}
