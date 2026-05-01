import { PartialType } from '@nestjs/mapped-types';
import { CreateWhitelistIpDto } from './create-whitelist-ip.dto';

export class UpdateWhitelistIpDto extends PartialType(CreateWhitelistIpDto) {}
