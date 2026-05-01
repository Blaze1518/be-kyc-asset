import { ApiProperty } from '@nestjs/swagger';

export class SuccessResponseDto<T> {
  @ApiProperty({ default: true })
  success: boolean;

  data: T;
}
