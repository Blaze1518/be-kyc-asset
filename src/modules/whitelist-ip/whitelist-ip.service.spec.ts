import { Test, TestingModule } from '@nestjs/testing';
import { WhitelistIpService } from './whitelist-ip.service';

describe('WhitelistIpService', () => {
  let service: WhitelistIpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WhitelistIpService],
    }).compile();

    service = module.get<WhitelistIpService>(WhitelistIpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
