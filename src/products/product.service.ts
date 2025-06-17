import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { Product } from "./entities/product.entity";
import { CacheService } from "src/src/cache.service";

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    private cacheService: CacheService
  ) {}

  async findAll(): Promise<Product[]> {
    const cachedProducts = await this.cacheService.getCachedProducts();
    if (cachedProducts !== undefined) return cachedProducts;

    const freshData = await this.productsRepository.find();
    await this.cacheService.setCacheProducts(freshData);
    return freshData;
  }

  async findOne(id: number): Promise<Product> {
    const cachedProduct = await this.cacheService.getCachedProduct(id);
    console.log("Logger: cached data", cachedProduct);
    if (cachedProduct !== undefined) {
      return cachedProduct;
    }

    const product = await this.productsRepository.findOne({ where: { id } });
    console.log("Logger: db data", cachedProduct);

    if (!product) {
      throw new HttpException("not found!", HttpStatus.UNPROCESSABLE_ENTITY);
    }

    await this.cacheService.setCacheProduct(id, product);
    return product;
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productsRepository.create(createProductDto);
    await this.cacheService.invalidateCachedProducts();
    return this.productsRepository.save(product);
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto
  ): Promise<Product> {
    await this.productsRepository.update(id, updateProductDto);
    await this.cacheService.invalidateCachedProducts();
    await this.cacheService.invalidateCachedProduct(id);

    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) {
      throw new HttpException("not found", HttpStatus.UNPROCESSABLE_ENTITY);
    }
    return product;
  }

  async remove(id: number): Promise<void> {
    await this.productsRepository.delete(id);
    await this.cacheService.invalidateCachedProducts();
    await this.cacheService.invalidateCachedProduct(id);
  }
}
