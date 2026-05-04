import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WhitelistIpRepository } from 'src/modules/whitelist-ip/repositories/whitelist-ip.repository';

@Injectable()
export class WhitelistIpGuard implements CanActivate {
  constructor(private readonly whitelistIpRepository: WhitelistIpRepository) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    return true;
  }
}
