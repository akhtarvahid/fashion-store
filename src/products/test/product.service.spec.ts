import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { DeleteResult, Repository, UpdateResult } from "typeorm";
import { HttpException, HttpStatus } from "@nestjs/common";
import { ProductsService } from "../product.service";
import { Product } from "../entities/product.entity";
import { CacheService } from "../../cache/cache.service";
import { CreateProductDto } from "../dto/create-product.dto";
import { UpdateProductDto } from "../dto/update-product.dto";
import { ProductResponseDto } from "../dto/product-response.dto";

describe("ProductsService", () => {
  let service: ProductsService;
  let productsRepository: Repository<Product>;
  let cacheService: CacheService;

  const mockProduct: Product = {
    id: 1,
    title: "Test Product",
    description: "Test Description",
    category: "electronics",
    image: "test.jpg",

    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockProductDto: CreateProductDto = {
    title: "New Product",
    description: "New Description",
    category: "clothing",
    image: "new.jpg",
  };

  const mockUpdateDto: UpdateProductDto = {
    title: "Updated Product",
    description: "",
    category: "home",
    image: "updated.jpg",
  };

  const mockProductResponse: ProductResponseDto = {
    id: 1,
    title: "Test Product",
    description: "Test Description",
    category: "electronics",
    image: "test.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: CacheService,
          useValue: {
            getCachedProducts: jest.fn(),
            setCacheProducts: jest.fn(),
            getCachedProduct: jest.fn(),
            setCacheProduct: jest.fn(),
            invalidateCachedProducts: jest.fn(),
            invalidateCachedProduct: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productsRepository = module.get<Repository<Product>>(
      getRepositoryToken(Product)
    );
    cacheService = module.get<CacheService>(CacheService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("findAll", () => {
    it("should return cached products if available", async () => {
      const cachedProducts = [mockProductResponse];
      jest
        .spyOn(cacheService, "getCachedProducts")
        .mockResolvedValue(cachedProducts);

      const result = await service.findAll();

      expect(result).toEqual(cachedProducts);
      expect(cacheService.getCachedProducts).toHaveBeenCalled();
      expect(productsRepository.find).not.toHaveBeenCalled();
    });

    it("should fetch from database and cache if no cached products", async () => {
      const dbProducts = [mockProduct];
      jest
        .spyOn(cacheService, "getCachedProducts")
        .mockResolvedValue(undefined);
      jest.spyOn(productsRepository, "find").mockResolvedValue(dbProducts);
      jest.spyOn(cacheService, "setCacheProducts").mockResolvedValue(undefined);

      const result = await service.findAll();

      expect(result).toEqual(dbProducts);
      expect(cacheService.getCachedProducts).toHaveBeenCalled();
      expect(productsRepository.find).toHaveBeenCalled();
      expect(cacheService.setCacheProducts).toHaveBeenCalledWith(dbProducts);
    });
  });

  describe("findOne", () => {
    it("should return cached product if available", async () => {
      jest
        .spyOn(cacheService, "getCachedProduct")
        .mockResolvedValue(mockProductResponse);

      const result = await service.findOne(1);

      expect(result).toEqual(mockProductResponse);
      expect(cacheService.getCachedProduct).toHaveBeenCalledWith(1);
      expect(productsRepository.findOne).not.toHaveBeenCalled();
    });

    it("should fetch from database and cache if no cached product", async () => {
      jest.spyOn(cacheService, "getCachedProduct").mockResolvedValue(undefined);
      jest.spyOn(productsRepository, "findOne").mockResolvedValue(mockProduct);
      jest.spyOn(cacheService, "setCacheProduct").mockResolvedValue(undefined);

      const result = await service.findOne(1);

      expect(result).toEqual(mockProduct);
      expect(cacheService.getCachedProduct).toHaveBeenCalledWith(1);
      expect(productsRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(cacheService.setCacheProduct).toHaveBeenCalledWith(1, mockProduct);
    });

    it("should throw HttpException if product not found", async () => {
      jest.spyOn(cacheService, "getCachedProduct").mockResolvedValue(undefined);
      jest.spyOn(productsRepository, "findOne").mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(
        new HttpException("not found!", HttpStatus.UNPROCESSABLE_ENTITY)
      );
    });
  });

  describe("create", () => {
    it("should create a new product and invalidate cache", async () => {
      const newProduct = {
        ...mockProductDto, // Include all DTO fields
        id: 2,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      };
      jest.spyOn(productsRepository, "create").mockReturnValue(newProduct);
      jest.spyOn(productsRepository, "save").mockResolvedValue(newProduct);
      jest
        .spyOn(cacheService, "invalidateCachedProducts")
        .mockResolvedValue(undefined);

      const result = await service.create(mockProductDto);

      expect(result).toEqual(newProduct);
      expect(productsRepository.create).toHaveBeenCalledWith(mockProductDto);
      expect(productsRepository.save).toHaveBeenCalledWith(newProduct);
      expect(cacheService.invalidateCachedProducts).toHaveBeenCalled();

      expect(result).toMatchObject({
        ...mockProductDto,
        id: expect.any(Number),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });
  });

  describe("update", () => {
    it("should update product and invalidate cache", async () => {
      const updatedProduct = { ...mockProduct, ...mockUpdateDto };
      const updateResult: UpdateResult = {
        generatedMaps: [],
        raw: [],
        affected: 1, // No rows affected
      };
      jest.spyOn(productsRepository, "update").mockResolvedValue(updateResult);
      jest
        .spyOn(productsRepository, "findOne")
        .mockResolvedValue(updatedProduct);
      jest
        .spyOn(cacheService, "invalidateCachedProducts")
        .mockResolvedValue(undefined);
      jest
        .spyOn(cacheService, "invalidateCachedProduct")
        .mockResolvedValue(undefined);

      const result = await service.update(1, mockUpdateDto);

      expect(result).toEqual(updatedProduct);
      expect(productsRepository.update).toHaveBeenCalledWith(1, mockUpdateDto);
      expect(productsRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(cacheService.invalidateCachedProducts).toHaveBeenCalled();
      expect(cacheService.invalidateCachedProduct).toHaveBeenCalledWith(1);
    });

    it("should throw HttpException if product not found after update", async () => {
      const updateResult: UpdateResult = {
        generatedMaps: [],
        raw: [],
        affected: 0, // No rows affected
      };
      jest.spyOn(productsRepository, "update").mockResolvedValue(updateResult);
      jest.spyOn(productsRepository, "findOne").mockResolvedValue(null);

      await expect(service.update(999, mockUpdateDto)).rejects.toThrow(
        new HttpException("not found", HttpStatus.UNPROCESSABLE_ENTITY)
      );
    });
  });

  describe("remove", () => {
    it("should delete product and invalidate cache", async () => {
      const deleteResult: DeleteResult = {
        raw: [],
        affected: 1,
      };
      jest.spyOn(productsRepository, "delete").mockResolvedValue(deleteResult);
      jest
        .spyOn(cacheService, "invalidateCachedProducts")
        .mockResolvedValue(undefined);
      jest
        .spyOn(cacheService, "invalidateCachedProduct")
        .mockResolvedValue(undefined);

      await service.remove(1);

      expect(productsRepository.delete).toHaveBeenCalledWith(1);
      expect(cacheService.invalidateCachedProducts).toHaveBeenCalled();
      expect(cacheService.invalidateCachedProduct).toHaveBeenCalledWith(1);
    });

    // You might also want to add a test case for when no rows are affected
    it("should still invalidate cache even if product not found", async () => {
      const deleteResult: DeleteResult = {
        raw: [],
        affected: 0,
      };

      jest.spyOn(productsRepository, "delete").mockResolvedValue(deleteResult);
      jest
        .spyOn(cacheService, "invalidateCachedProducts")
        .mockResolvedValue(undefined);
      jest
        .spyOn(cacheService, "invalidateCachedProduct")
        .mockResolvedValue(undefined);

      await service.remove(999); // Non-existent ID

      expect(productsRepository.delete).toHaveBeenCalledWith(999);
      expect(cacheService.invalidateCachedProducts).toHaveBeenCalled();
      expect(cacheService.invalidateCachedProduct).toHaveBeenCalledWith(999);
    });
  });
});
