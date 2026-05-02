import { Test, TestingModule } from '@nestjs/testing';
import { WhitelistIpService } from './whitelist-ip.service';
import { WhitelistIpRepository } from './repositories/whitelist-ip.repository';

jest.mock('./repositories/whitelist-ip.repository', () => ({
  WhitelistIpRepository: class WhitelistIpRepository {},
}));

describe('WhitelistIpService', () => {
  let service: WhitelistIpService;

  const mockWhitelistIpRepository = {
    create: jest.fn(),
    findUnique: jest.fn(),
    findManyPaginated: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WhitelistIpService,
        {
          provide: WhitelistIpRepository,
          useValue: mockWhitelistIpRepository,
        },
      ],
    }).compile();

    service = module.get<WhitelistIpService>(WhitelistIpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
