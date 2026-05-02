import { Test, TestingModule } from '@nestjs/testing';
import { WhitelistIpController } from './whitelist-ip.controller';
import { WhitelistIpService } from './whitelist-ip.service';

jest.mock('./whitelist-ip.service', () => ({
  WhitelistIpService: class WhitelistIpService {},
}));

jest.mock(
  'src/common/decorators/swagger/errors.decorator',
  () => ({
    ApiStandardError: () => () => undefined,
  }),
  { virtual: true },
);

jest.mock(
  'src/common/decorators/swagger/success.decorator',
  () => ({
    ApiStandardSuccess: () => () => undefined,
  }),
  { virtual: true },
);

jest.mock(
  'src/common/dto/query.dto',
  () => ({
    QueryDto: class QueryDto {},
  }),
  { virtual: true },
);

jest.mock(
  'src/common/dto/param-id.dto',
  () => ({
    ParamsWithIdDto: class ParamsWithIdDto {
      id: string;
    },
  }),
  { virtual: true },
);

describe('WhitelistIpController', () => {
  let controller: WhitelistIpController;

  const mockWhitelistIpService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WhitelistIpController],
      providers: [
        {
          provide: WhitelistIpService,
          useValue: mockWhitelistIpService,
        },
      ],
    }).compile();

    controller = module.get<WhitelistIpController>(WhitelistIpController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
