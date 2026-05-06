import { Test, TestingModule } from '@nestjs/testing';
import { DepartmentsController } from './departments.controller';
import { DepartmentsService } from './departments.service';
import { ResponseDepartmentDto } from './dto/response-department.dto';
import { QueryDto, SortOrder } from 'src/common/dto/query.dto';

jest.mock('./departments.service', () => ({
  DepartmentsService: class DepartmentsService {},
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
    SortOrder: { ASC: 'asc', DESC: 'desc' },
  }),
  { virtual: true },
);

describe('DepartmentsController', () => {
  let controller: DepartmentsController;
  let service: jest.Mocked<DepartmentsService>;

  const departmentId = '550e8400-e29b-41d4-a716-446655440000';
  const department = {
    id: departmentId,
    code: 'KYC_HCM',
    name: 'Phòng KYC HCM',
    createdAt: new Date('2026-05-02T10:00:00.000Z'),
    updatedAt: new Date('2026-05-02T10:00:00.000Z'),
    deletedAt: null,
    internalField: 'should not be exposed',
  };

  const createDepartmentDto = {
    code: 'KYC_HCM',
    name: 'Phòng KYC HCM',
  };

  const updateDepartmentDto = {
    name: 'Phòng KYC TPHCM',
  };

  const queryDto: QueryDto = {
    search: 'KYC',
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: SortOrder.DESC,
  };

  const mockDepartmentsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DepartmentsController],
      providers: [
        {
          provide: DepartmentsService,
          useValue: mockDepartmentsService,
        },
      ],
    }).compile();

    controller = module.get<DepartmentsController>(DepartmentsController);
    service = module.get(DepartmentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a department and return response dto', async () => {
      service.create.mockResolvedValue(department);

      const result = await controller.create(createDepartmentDto);

      expect(service.create).toHaveBeenCalledWith(createDepartmentDto);
      expect(result).toBeInstanceOf(ResponseDepartmentDto);
      expect(result).toEqual(
        expect.objectContaining({
          id: department.id,
          code: department.code,
          name: department.name,
        }),
      );
      expect(result).not.toHaveProperty('internalField');
      expect(result).not.toHaveProperty('deletedAt');
    });
  });

  describe('findAll', () => {
    it('should return paginated departments from service', () => {
      const paginatedResult = {
        items: [department],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };

      service.findAll.mockResolvedValue(paginatedResult);

      const result = controller.findAll(queryDto);

      expect(service.findAll).toHaveBeenCalledWith(queryDto);
      expect(result).resolves.toEqual(paginatedResult);
    });
  });

  describe('findOne', () => {
    it('should return a department by id as response dto', async () => {
      service.findOne.mockResolvedValue(department);

      const result = await controller.findOne({ id: departmentId });

      expect(service.findOne).toHaveBeenCalledWith(departmentId);
      expect(result).toBeInstanceOf(ResponseDepartmentDto);
      expect(result).toEqual(
        expect.objectContaining({
          id: department.id,
          code: department.code,
          name: department.name,
        }),
      );
      expect(result).not.toHaveProperty('internalField');
    });
  });

  describe('update', () => {
    it('should update a department and return response dto', async () => {
      const updatedDepartment = {
        ...department,
        ...updateDepartmentDto,
      };

      service.update.mockResolvedValue(updatedDepartment);

      const result = await controller.update(
        { id: departmentId },
        updateDepartmentDto,
      );

      expect(service.update).toHaveBeenCalledWith(
        departmentId,
        updateDepartmentDto,
      );
      expect(result).toBeInstanceOf(ResponseDepartmentDto);
      expect(result).toEqual(
        expect.objectContaining({
          id: department.id,
          code: department.code,
          name: updateDepartmentDto.name,
        }),
      );
      expect(result).not.toHaveProperty('internalField');
    });
  });

  describe('remove', () => {
    it('should soft-delete a department and return response dto', async () => {
      const softDeleted = { ...department, deletedAt: new Date() };

      service.remove.mockResolvedValue(softDeleted);

      const result = await controller.remove({ id: departmentId });

      expect(service.remove).toHaveBeenCalledWith(departmentId);
      expect(result).toBeInstanceOf(ResponseDepartmentDto);
      expect(result).toEqual(
        expect.objectContaining({
          id: department.id,
          code: department.code,
        }),
      );
      expect(result).not.toHaveProperty('internalField');
      expect(result).not.toHaveProperty('deletedAt');
    });
  });
});
