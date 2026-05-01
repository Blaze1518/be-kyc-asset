import { Test, TestingModule } from '@nestjs/testing';
import { AttributeController } from './attribute.controller';
import { AttributeService } from './attribute.service';
import { ResponseAttributeDto } from './dto/response-attribute.dto';
import { SortOrder } from './dto/query-attribute.dto';

jest.mock('./attribute.service', () => ({
  AttributeService: class AttributeService {},
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

describe('AttributeController', () => {
  let controller: AttributeController;
  let service: jest.Mocked<AttributeService>;

  const attributeId = '550e8400-e29b-41d4-a716-446655440000';
  const attribute = {
    id: attributeId,
    name: 'department',
    internalField: 'should not be exposed',
  };

  const createAttributeDto = {
    name: 'department',
  };

  const updateAttributeDto = {
    name: 'position',
  };

  const queryAttributeDto = {
    search: 'dep',
    page: 1,
    limit: 10,
    sortBy: 'name',
    sortOrder: SortOrder.ASC,
  };

  const mockAttributeService = {
    create: jest.fn(),
    findAllPaginated: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttributeController],
      providers: [
        {
          provide: AttributeService,
          useValue: mockAttributeService,
        },
      ],
    }).compile();

    controller = module.get<AttributeController>(AttributeController);
    service = module.get(AttributeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an attribute and return response dto', async () => {
      service.create.mockResolvedValue(attribute);

      const result = await controller.create(createAttributeDto);

      expect(service.create).toHaveBeenCalledWith(createAttributeDto);
      expect(result).toBeInstanceOf(ResponseAttributeDto);
      expect(result).toEqual({
        id: attribute.id,
        name: attribute.name,
      });
      expect(result).not.toHaveProperty('internalField');
    });
  });

  describe('findAllPaginated', () => {
    it('should return paginated attributes from service', () => {
      const paginatedResult = {
        items: [attribute],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };

      service.findAllPaginated.mockResolvedValue(paginatedResult);

      const result = controller.findAllPaginated(queryAttributeDto);

      expect(service.findAllPaginated).toHaveBeenCalledWith(queryAttributeDto);
      expect(result).resolves.toEqual(paginatedResult);
    });
  });

  describe('findOne', () => {
    it('should return an attribute by id as response dto', async () => {
      service.findOne.mockResolvedValue(attribute);

      const result = await controller.findOne({ id: attributeId });

      expect(service.findOne).toHaveBeenCalledWith(attributeId);
      expect(result).toBeInstanceOf(ResponseAttributeDto);
      expect(result).toEqual({
        id: attribute.id,
        name: attribute.name,
      });
      expect(result).not.toHaveProperty('internalField');
    });
  });

  describe('update', () => {
    it('should update an attribute and return response dto', async () => {
      const updatedAttribute = {
        ...attribute,
        ...updateAttributeDto,
      };

      service.update.mockResolvedValue(updatedAttribute);

      const result = await controller.update({ id: attributeId }, updateAttributeDto);

      expect(service.update).toHaveBeenCalledWith(attributeId, updateAttributeDto);
      expect(result).toBeInstanceOf(ResponseAttributeDto);
      expect(result).toEqual({
        id: attribute.id,
        name: updateAttributeDto.name,
      });
      expect(result).not.toHaveProperty('internalField');
    });
  });

  describe('remove', () => {
    it('should remove an attribute and return response dto', async () => {
      service.remove.mockResolvedValue(attribute);

      const result = await controller.remove({ id: attributeId });

      expect(service.remove).toHaveBeenCalledWith(attributeId);
      expect(result).toBeInstanceOf(ResponseAttributeDto);
      expect(result).toEqual({
        id: attribute.id,
        name: attribute.name,
      });
      expect(result).not.toHaveProperty('internalField');
    });
  });
});
