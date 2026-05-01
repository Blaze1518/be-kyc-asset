import { Test, TestingModule } from '@nestjs/testing';
import { WhitelistIpController } from './whitelist-ip.controller';
import { WhitelistIpService } from './whitelist-ip.service';

describe('WhitelistIpController', () => {
  let controller: WhitelistIpController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WhitelistIpController],
      providers: [WhitelistIpService],
    }).compile();

    controller = module.get<WhitelistIpController>(WhitelistIpController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
