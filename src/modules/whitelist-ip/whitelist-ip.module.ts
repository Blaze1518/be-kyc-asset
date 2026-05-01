import { Module } from '@nestjs/common';
import { WhitelistIpService } from './whitelist-ip.service';
import { WhitelistIpController } from './whitelist-ip.controller';

@Module({
  controllers: [WhitelistIpController],
  providers: [WhitelistIpService],
})
export class WhitelistIpModule {}
