import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersMapper } from './users.mapper';

jest.mock('./users.service', () => ({
  UsersService: class UsersService {},
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

describe('UsersController', () => {
  let controller: UsersController;
  const user = {
    id: 'user-id',
    username: 'admin_pro',
    displayName: 'Admin Pro',
    roles: [],
  };
  const responseUser = {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    roles: [],
  };

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockUsersMapper = {
    toResponse: jest.fn(),
    toPaginatedResponse: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: UsersMapper,
          useValue: mockUsersMapper,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('maps create result through UsersMapper', async () => {
    const dto = {
      username: user.username,
      displayName: user.displayName,
      password: 'Password@123',
    };
    mockUsersService.create.mockResolvedValue(user);
    mockUsersMapper.toResponse.mockReturnValue(responseUser);

    await expect(controller.create(dto)).resolves.toBe(responseUser);
    expect(mockUsersService.create).toHaveBeenCalledWith(dto);
    expect(mockUsersMapper.toResponse).toHaveBeenCalledWith(user);
  });

  it('maps paginated findAll result through UsersMapper', async () => {
    const result = {
      items: [user],
      meta: {
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    };
    const mappedResult = {
      ...result,
      items: [responseUser],
    };
    mockUsersService.findAll.mockResolvedValue(result);
    mockUsersMapper.toPaginatedResponse.mockReturnValue(mappedResult);

    await expect(controller.findAll({} as any)).resolves.toBe(mappedResult);
    expect(mockUsersService.findAll).toHaveBeenCalledWith({});
    expect(mockUsersMapper.toPaginatedResponse).toHaveBeenCalledWith(result);
  });
});
