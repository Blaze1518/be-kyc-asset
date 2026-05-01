import { Injectable } from '@nestjs/common';
import { CreateWhitelistIpDto } from './dto/create-whitelist-ip.dto';
import { UpdateWhitelistIpDto } from './dto/update-whitelist-ip.dto';

@Injectable()
export class WhitelistIpService {
  create(createWhitelistIpDto: CreateWhitelistIpDto) {
    return 'This action adds a new whitelistIp';
  }

  findAll() {
    return `This action returns all whitelistIp`;
  }

  findOne(id: number) {
    return `This action returns a #${id} whitelistIp`;
  }

  update(id: number, updateWhitelistIpDto: UpdateWhitelistIpDto) {
    return `This action updates a #${id} whitelistIp`;
  }

  remove(id: number) {
    return `This action removes a #${id} whitelistIp`;
  }
}
