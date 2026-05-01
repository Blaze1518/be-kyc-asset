import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AttributeService } from './attribute.service';
import { AttributesRepository } from './repositories/attributes.repository';

jest.mock('./repositories/attributes.repository', () => ({
  AttributesRepository: class AttributesRepository {},
}));

describe('AttributeService', () => {
  let service: AttributeService;
  let repository: jest.Mocked<AttributesRepository>;

  const attributeId = '550e8400-e29b-41d4-a716-446655440000';
  const attribute = {
    id: attributeId,
    name: 'department',
  };

  const createAttributeDto = {
    name: 'department',
  };

  const updateAttributeDto = {
    name: 'position',
  };

  const mockAttributesRepository = {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttributeService,
        {
          provide: AttributesRepository,
          useValue: mockAttributesRepository,
        },
      ],
    }).compile();

    service = module.get<AttributeService>(AttributeService);
    repository = module.get(AttributesRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an attribute', async () => {
      repository.create.mockResolvedValue(attribute);

      await expect(service.create(createAttributeDto)).resolves.toEqual(
        attribute,
      );
      expect(repository.create).toHaveBeenCalledWith({
        data: createAttributeDto,
      });
    });
  });

  describe('findAll', () => {
    it('should return all attributes', async () => {
      repository.findMany.mockResolvedValue([attribute]);

      await expect(service.findAll()).resolves.toEqual([attribute]);
      expect(repository.findMany).toHaveBeenCalledWith();
    });
  });

  describe('findOne', () => {
    it('should return an attribute by id', async () => {
      repository.findUnique.mockResolvedValue(attribute);

      await expect(service.findOne(attributeId)).resolves.toEqual(attribute);
      expect(repository.findUnique).toHaveBeenCalledWith({
        where: { id: attributeId },
      });
    });

    it('should throw NotFoundException when attribute does not exist', async () => {
      repository.findUnique.mockResolvedValue(null);

      await expect(service.findOne(attributeId)).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.findUnique).toHaveBeenCalledWith({
        where: { id: attributeId },
      });
    });
  });

  describe('update', () => {
    it('should update an existing attribute', async () => {
      const updatedAttribute = {
        ...attribute,
        ...updateAttributeDto,
      };

      repository.findUnique.mockResolvedValue(attribute);
      repository.update.mockResolvedValue(updatedAttribute);

      await expect(
        service.update(attributeId, updateAttributeDto),
      ).resolves.toEqual(updatedAttribute);
      expect(repository.findUnique).toHaveBeenCalledWith({
        where: { id: attributeId },
      });
      expect(repository.update).toHaveBeenCalledWith({
        where: { id: attributeId },
        data: updateAttributeDto,
      });
    });

    it('should throw NotFoundException and not update when attribute does not exist', async () => {
      repository.findUnique.mockResolvedValue(null);

      await expect(service.update(attributeId, updateAttributeDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete an existing attribute', async () => {
      repository.findUnique.mockResolvedValue(attribute);
      repository.delete.mockResolvedValue(attribute);

      await expect(service.remove(attributeId)).resolves.toEqual(attribute);
      expect(repository.findUnique).toHaveBeenCalledWith({
        where: { id: attributeId },
      });
      expect(repository.delete).toHaveBeenCalledWith({
        where: { id: attributeId },
      });
    });

    it('should throw NotFoundException and not delete when attribute does not exist', async () => {
      repository.findUnique.mockResolvedValue(null);

      await expect(service.remove(attributeId)).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.delete).not.toHaveBeenCalled();
    });
  });
});
