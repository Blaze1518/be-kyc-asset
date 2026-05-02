import { Module } from '@nestjs/common';
import { WhitelistIpService } from './whitelist-ip.service';
import { WhitelistIpController } from './whitelist-ip.controller';
import { WhitelistIpRepository } from './repositories/whitelist-ip.repository';

@Module({
  controllers: [WhitelistIpController],
  providers: [WhitelistIpService, WhitelistIpRepository],
})
export class WhitelistIpModule {}
