import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
export class ResponseAttributeDto {
  @ApiProperty({ example: '123' })
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  _count?: {
    conditions: number;
  };

  constructor(partial: Partial<ResponseAttributeDto>) {
    Object.assign(this, partial);
  }
}
