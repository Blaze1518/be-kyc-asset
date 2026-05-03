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
  const txCtx = { tx: true };
  const externalCtx = { external: true };

  const createdUser = {
    id: 'user-id',
    username: 'admin_pro',
    displayName: 'Admin Pro',
    hashed_password: 'hashed-password',
    token_version: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    roles: [],
  };

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

  it('creates a user inside caller transaction context when ctx is provided', async () => {
    mockPasswordHasher.hash.mockResolvedValue('hashed-password');
    mockUsersRepository.create.mockResolvedValue({ id: createdUser.id });
    mockUsersRepository.findByIdWithRoles.mockResolvedValue(createdUser);

    const result = await service.create(
      {
        username: createdUser.username,
        displayName: createdUser.displayName,
        password: 'Password@123',
        roles: [{ id: 'role-id' }],
      },
      externalCtx as any,
    );

    expect(result).toBe(createdUser);
    expect(mockTransactionManager.run).not.toHaveBeenCalled();
    expect(mockUsersRepository.create).toHaveBeenCalledWith(
      {
        data: {
          username: createdUser.username,
          displayName: createdUser.displayName,
          hashed_password: 'hashed-password',
        },
      },
      externalCtx,
    );
    expect(mockUserRolesRepository.createMany).toHaveBeenCalledWith(
      {
        data: [
          {
            user_id: createdUser.id,
            role_id: 'role-id',
          },
        ],
      },
      externalCtx,
    );
    expect(mockUsersRepository.findByIdWithRoles).toHaveBeenCalledWith(
      createdUser.id,
      externalCtx,
    );
  });

  it('opens a transaction when creating a user without caller context', async () => {
    mockTransactionManager.run.mockImplementation((work) => work(txCtx));
    mockPasswordHasher.hash.mockResolvedValue('hashed-password');
    mockUsersRepository.create.mockResolvedValue({ id: createdUser.id });
    mockUsersRepository.findByIdWithRoles.mockResolvedValue(createdUser);

    const result = await service.create({
      username: createdUser.username,
      displayName: createdUser.displayName,
      password: 'Password@123',
    });

    expect(result).toBe(createdUser);
    expect(mockTransactionManager.run).toHaveBeenCalledTimes(1);
    expect(mockUsersRepository.create).toHaveBeenCalledWith(
      {
        data: {
          username: createdUser.username,
          displayName: createdUser.displayName,
          hashed_password: 'hashed-password',
        },
      },
      txCtx,
    );
    expect(mockUserRolesRepository.createMany).not.toHaveBeenCalled();
  });
});
