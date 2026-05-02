import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from './roles.service';
import { TransactionManager } from 'src/common/database/abstract/transaction-manager.abstract';
import { RolesRepository } from './repositories/roles.repository';
import { RolePermissionsRepository } from './repositories/role-permissions.repository';

jest.mock(
  'src/common/database/abstract/transaction-manager.abstract',
  () => ({
    TransactionManager: class TransactionManager {},
  }),
  { virtual: true },
);

jest.mock('./repositories/roles.repository', () => ({
  RolesRepository: class RolesRepository {},
}));

jest.mock('./repositories/role-permissions.repository', () => ({
  RolePermissionsRepository: class RolePermissionsRepository {},
}));

describe('RolesService', () => {
  let service: RolesService;

  const mockTransactionManager = {
    run: jest.fn(),
  };

  const mockRolesRepository = {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findByIdWithPermissions: jest.fn(),
    findManyPaginated: jest.fn(),
  };

  const mockRolePermissionsRepository = {
    createMany: jest.fn(),
    deleteMany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: TransactionManager,
          useValue: mockTransactionManager,
        },
        {
          provide: RolesRepository,
          useValue: mockRolesRepository,
        },
        {
          provide: RolePermissionsRepository,
          useValue: mockRolePermissionsRepository,
        },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
