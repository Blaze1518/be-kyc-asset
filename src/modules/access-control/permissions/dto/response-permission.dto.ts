import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ResponseAttributeDto } from '../../attribute/dto/response-attribute.dto';

export class ResponsePermissionConditionDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty({ description: 'Giá trị logic lưu trong JsonB' })
  @Expose({ name: 'conditions' })
  logic: any;

  @ApiProperty({ type: () => ResponseAttributeDto })
  @Expose()
  @Type(() => ResponseAttributeDto)
  attribute: ResponseAttributeDto;

  @Expose()
  attribute_id: string;
}
