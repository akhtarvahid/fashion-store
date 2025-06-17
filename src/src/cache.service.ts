import { Injectable, Inject } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { Product } from "src/products/entities/product.entity";

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}
  private trackedKeys: Set<string> = new Set();

  async get<T>(key: string): Promise<T | undefined> {
    return this.cacheManager.get<T>(key);
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async reset(): Promise<void> {
    for (const key of this.trackedKeys) {
      await this.del(key);
    }
    this.trackedKeys.clear();
  }

  // Product-specific cache methods
  async getCachedProducts(): Promise<Product[] | undefined> {
    return this.get<Product[]>("all_products");
  }

  async setCacheProducts(products: Product[]): Promise<void> {
    // Only cache non-empty arrays
    if (products?.length > 0) {
      await this.set("all_products", products);
    }
  }

  async getCachedProduct(id: number): Promise<Product | undefined> {
    return this.get<Product>(`product_${id}`);
  }

  async setCacheProduct(id: number, product: Product): Promise<void> {
    await this.set(`product_${id}`, product);
  }

  async invalidateCachedProducts(): Promise<void> {
    await this.del("all_products");
  }

  async invalidateCachedProduct(id: number): Promise<void> {
    await this.del(`product_${id}`);
  }
}
