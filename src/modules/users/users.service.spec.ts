import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { TransactionManager } from 'src/common/database/abstract/transaction-manager.abstract';
import { UsersRepository } from './repositories/users.repository';
import { UserRolesRepository } from './repositories/user-roles.repository';
import { PasswordHasher } from './password-hasher.service';

jest.mock(
  'src/common/database/abstract/transaction-manager.abstract',
  () => ({
    TransactionManager: class TransactionManager {},
  }),
  { virtual: true },
);

jest.mock('./repositories/users.repository', () => ({
  UsersRepository: class UsersRepository {},
}));

jest.mock('./repositories/user-roles.repository', () => ({
  UserRolesRepository: class UserRolesRepository {},
}));

describe('UsersService', () => {
  let service: UsersService;

  const mockTransactionManager = {
    run: jest.fn(),
  };

  const mockUsersRepository = {
    create: jest.fn(),
    update: jest.fn(),
    findUnique: jest.fn(),
    findByIdWithRoles: jest.fn(),
    findManyPaginated: jest.fn(),
  };

  const mockUserRolesRepository = {
    createMany: jest.fn(),
    deleteMany: jest.fn(),
  };

  const mockPasswordHasher = {
    hash: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: TransactionManager,
          useValue: mockTransactionManager,
        },
        {
          provide: UsersRepository,
          useValue: mockUsersRepository,
        },
        {
          provide: UserRolesRepository,
          useValue: mockUserRolesRepository,
        },
        {
          provide: PasswordHasher,
          useValue: mockPasswordHasher,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
