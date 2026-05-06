import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { DepartmentsRepository } from './repositories/departments.repository';

jest.mock('./repositories/departments.repository', () => ({
  DepartmentsRepository: class DepartmentsRepository {},
}));

describe('DepartmentsService', () => {
  let service: DepartmentsService;
  let repository: jest.Mocked<DepartmentsRepository>;

  const departmentId = '550e8400-e29b-41d4-a716-446655440000';
  const department = {
    id: departmentId,
    code: 'KYC_HCM',
    name: 'Phòng KYC HCM',
    createdAt: new Date('2026-05-02T10:00:00.000Z'),
    updatedAt: new Date('2026-05-02T10:00:00.000Z'),
    deletedAt: null,
  };

  const createDepartmentDto = {
    code: 'KYC_HCM',
    name: 'Phòng KYC HCM',
  };

  const updateDepartmentDto = {
    name: 'Phòng KYC TPHCM',
  };

  const mockDepartmentsRepository = {
    create: jest.fn(),
    findActiveById: jest.fn(),
    findManyPaginated: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepartmentsService,
        {
          provide: DepartmentsRepository,
          useValue: mockDepartmentsRepository,
        },
      ],
    }).compile();

    service = module.get<DepartmentsService>(DepartmentsService);
    repository = module.get(DepartmentsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a department', async () => {
      repository.create.mockResolvedValue(department);

      await expect(service.create(createDepartmentDto)).resolves.toEqual(
        department,
      );
      expect(repository.create).toHaveBeenCalledWith({
        data: createDepartmentDto,
      });
    });
  });

  describe('findAll', () => {
    it('should forward query to repository and shape paginated result', async () => {
      repository.findManyPaginated.mockResolvedValue([[department], 1]);

      const result = await service.findAll({
        search: 'KYC',
        page: 1,
        limit: 10,
      });

      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toEqual(
        expect.objectContaining({
          id: department.id,
          code: department.code,
          name: department.name,
        }),
      );
      expect(result.items[0]).not.toHaveProperty('deletedAt');
      expect(result.meta).toEqual({
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });

      expect(repository.findManyPaginated).toHaveBeenCalledWith({
        search: 'KYC',
        page: 1,
        limit: 10,
      });
    });

    it('should default page/limit when omitted', async () => {
      repository.findManyPaginated.mockResolvedValue([[], 0]);

      await service.findAll({});

      expect(repository.findManyPaginated).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });
    });
  });

  describe('findOne', () => {
    it('should return a department by id', async () => {
      repository.findActiveById.mockResolvedValue(department);

      await expect(service.findOne(departmentId)).resolves.toEqual(department);
      expect(repository.findActiveById).toHaveBeenCalledWith(departmentId);
    });

    it('should throw NotFoundException when department does not exist', async () => {
      repository.findActiveById.mockResolvedValue(null);

      await expect(service.findOne(departmentId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update an existing department', async () => {
      const updatedDepartment = { ...department, ...updateDepartmentDto };

      repository.findActiveById.mockResolvedValue(department);
      repository.update.mockResolvedValue(updatedDepartment);

      await expect(
        service.update(departmentId, updateDepartmentDto),
      ).resolves.toEqual(updatedDepartment);

      expect(repository.findActiveById).toHaveBeenCalledWith(departmentId);
      expect(repository.update).toHaveBeenCalledWith({
        where: { id: departmentId },
        data: updateDepartmentDto,
      });
    });

    it('should throw NotFoundException and not update when department does not exist', async () => {
      repository.findActiveById.mockResolvedValue(null);

      await expect(
        service.update(departmentId, updateDepartmentDto),
      ).rejects.toThrow(NotFoundException);
      expect(repository.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should soft-delete an existing department through repository helper', async () => {
      const softDeleted = { ...department, deletedAt: new Date() };

      repository.findActiveById.mockResolvedValue(department);
      repository.softDelete.mockResolvedValue(softDeleted);

      const result = await service.remove(departmentId);

      expect(result).toEqual(softDeleted);
      expect(repository.findActiveById).toHaveBeenCalledWith(departmentId);
      expect(repository.softDelete).toHaveBeenCalledWith(departmentId);
    });

    it('should throw NotFoundException and not soft-delete when department does not exist', async () => {
      repository.findActiveById.mockResolvedValue(null);

      await expect(service.remove(departmentId)).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.softDelete).not.toHaveBeenCalled();
    });
  });
});
