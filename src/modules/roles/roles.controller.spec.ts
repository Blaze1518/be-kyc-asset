import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

jest.mock('./roles.service', () => ({
  RolesService: class RolesService {},
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

describe('RolesController', () => {
  let controller: RolesController;

  const mockRolesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        {
          provide: RolesService,
          useValue: mockRolesService,
        },
      ],
    }).compile();

    controller = module.get<RolesController>(RolesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
