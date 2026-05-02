import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';
import { ResponsePermissionConditionDto } from './dto/response-permission.dto';

jest.mock('./permissions.service', () => ({
  PermissionsService: class PermissionsService {},
}));

jest.mock(
  'src/common/dto/param-id.dto',
  () => ({
    ParamsWithIdDto: class ParamsWithIdDto {
      id: string;
    },
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

describe('PermissionsController', () => {
  let controller: PermissionsController;
  let service: jest.Mocked<PermissionsService>;

  const permissionId = '550e8400-e29b-41d4-a716-446655440000';
  const attributeId = '550e8400-e29b-41d4-a716-446655440001';
  const permissionCondition = {
    id: permissionId,
    conditions: { eq: 'admin' },
    attribute_id: attributeId,
    attribute: {
      id: attributeId,
      name: 'department',
    },
    internalField: 'should not be exposed',
  };

  const createPermissionDto = {
    name: 'view_user',
    description: 'Cho phép xem thông tin người dùng',
    conditions: [
      {
        attribute_id: attributeId,
        logic: { eq: 'admin' },
      },
    ],
  };

  const updatePermissionDto = {
    name: 'edit_user',
    description: 'Cho phép chỉnh sửa thông tin người dùng',
    conditions: [
      {
        attribute_id: attributeId,
        logic: { contains: 'manager' },
      },
    ],
  };

  const query = {
    search: 'user',
    page: 1,
    limit: 10,
    sortBy: 'name',
    sortOrder: 'asc',
  };

  const mockPermissionsService = {
    createPermission: jest.fn(),
    findAllPaginated: jest.fn(),
    updatePermission: jest.fn(),
    deletePermission: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermissionsController],
      providers: [
        {
          provide: PermissionsService,
          useValue: mockPermissionsService,
        },
      ],
    }).compile();

    controller = module.get<PermissionsController>(PermissionsController);
    service = module.get(PermissionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a permission and return response dto', async () => {
      service.createPermission.mockResolvedValue(permissionCondition as never);

      const result = await controller.create(createPermissionDto);

      expect(service.createPermission).toHaveBeenCalledWith(createPermissionDto);
      expect(result).toBeInstanceOf(ResponsePermissionConditionDto);
      expect(result).toEqual({
        id: permissionCondition.id,
        logic: permissionCondition.conditions,
        attribute_id: permissionCondition.attribute_id,
        attribute: {
          id: attributeId,
          name: 'department',
        },
      });
      expect(result).not.toHaveProperty('internalField');
    });
  });

  describe('findAllPaginated', () => {
    it('should return paginated permissions from service', () => {
      const paginatedResult = {
        items: [permissionCondition],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };

      service.findAllPaginated.mockResolvedValue(paginatedResult as never);

      const result = controller.findAllPaginated(query as never);

      expect(service.findAllPaginated).toHaveBeenCalledWith(query);
      expect(result).resolves.toEqual(paginatedResult);
    });
  });

  describe('update', () => {
    it('should update a permission and return response dto', async () => {
      const updatedPermissionCondition = {
        ...permissionCondition,
        conditions: { contains: 'manager' },
      };

      service.updatePermission.mockResolvedValue(
        updatedPermissionCondition as never,
      );

      const result = await controller.update(
        { id: permissionId },
        updatePermissionDto,
      );

      expect(service.updatePermission).toHaveBeenCalledWith(
        permissionId,
        updatePermissionDto,
      );
      expect(result).toBeInstanceOf(ResponsePermissionConditionDto);
      expect(result).toEqual({
        id: permissionCondition.id,
        logic: updatedPermissionCondition.conditions,
        attribute_id: permissionCondition.attribute_id,
        attribute: {
          id: attributeId,
          name: 'department',
        },
      });
      expect(result).not.toHaveProperty('internalField');
    });
  });

  describe('remove', () => {
    it('should remove a permission and return response dto', async () => {
      service.deletePermission.mockResolvedValue(permissionCondition as never);

      const result = await controller.remove({ id: permissionId });

      expect(service.deletePermission).toHaveBeenCalledWith(permissionId);
      expect(result).toBeInstanceOf(ResponsePermissionConditionDto);
      expect(result).toEqual({
        id: permissionCondition.id,
        logic: permissionCondition.conditions,
        attribute_id: permissionCondition.attribute_id,
        attribute: {
          id: attributeId,
          name: 'department',
        },
      });
      expect(result).not.toHaveProperty('internalField');
    });
  });
});
