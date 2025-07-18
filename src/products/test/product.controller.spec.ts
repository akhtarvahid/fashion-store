import { Test, TestingModule } from "@nestjs/testing";
import { ProductsController } from "../product.controller";
import { ProductsService } from "../product.service";
import { Product } from "../entities/product.entity";
import { UpdateProductDto } from "../dto/update-product.dto";
import { CreateProductDto } from "../dto/create-product.dto";

describe("ProductsController", () => {
  let controller: ProductsController;
  let service: ProductsService;

  const mockProduct: Product = {
    id: 1,
    title: "Test Product",
    description: "Test Description",
    category: "Test Category",
    image: "test.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([mockProduct]),
            findOne: jest
              .fn()
              .mockImplementation((id: number) =>
                Promise.resolve({ ...mockProduct, id })
              ),
            create: jest
              .fn()
              .mockImplementation((dto: CreateProductDto) =>
                Promise.resolve({ ...mockProduct, ...dto })
              ),
            update: jest
              .fn()
              .mockImplementation((id: number, dto: UpdateProductDto) =>
                Promise.resolve({ ...mockProduct, id, ...dto })
              ),
            remove: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  describe("findAll()", () => {
    it("should return an array of products", async () => {
      await expect(controller.findAll()).resolves.toEqual([mockProduct]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe("findOne()", () => {
    it("should return a single product", async () => {
      await expect(controller.findOne("1")).resolves.toEqual({
        ...mockProduct,
        id: 1,
      });
      expect(service.findOne).toHaveBeenCalledWith(1);
    });

    it("should throw an error for invalid id", async () => {
      jest.spyOn(service, "findOne").mockRejectedValue(new Error("Not Found"));
      await expect(controller.findOne("999")).rejects.toThrow("Not Found");
    });
  });

  describe("create()", () => {
    it("should create a new product", async () => {
      const createDto: CreateProductDto = {
        title: "New Product",
        description: "New Description",
        category: "New Category",
        image: "new.jpg",
      };

      await expect(controller.create(createDto)).resolves.toEqual({
        ...mockProduct,
        ...createDto,
      });
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe("update()", () => {
    it("should update a product", async () => {
      const updateDto: UpdateProductDto = {
        title: "Updated Product",
        description: "Updated Description",
        category: "",
        image: "http://dummy.png",
      };

      await expect(controller.update("1", updateDto)).resolves.toEqual({
        ...mockProduct,
        id: 1,
        ...updateDto,
      });
      expect(service.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe("remove()", () => {
    it("should delete a product", async () => {
      await expect(controller.remove("1")).resolves.toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
