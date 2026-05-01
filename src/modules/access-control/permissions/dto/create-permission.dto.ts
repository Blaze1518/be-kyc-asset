import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNotEmpty,
  IsUUID,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PermissionConditionDto {
  @IsUUID()
  @IsNotEmpty()
  attribute_id: string;

  @IsNotEmpty()
  @IsObject()
  logic: any;
}

export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PermissionConditionDto)
  conditions: PermissionConditionDto[];
}
