import { Controller, Delete } from '@nestjs/common';
import { CacheService } from './cache.service';

@Controller('cache')
export class CacheController {
  constructor(private readonly cacheService: CacheService) {}

  @Delete('products')
  async resetProductCache() {
    await this.cacheService.invalidateCachedProducts();
    return { success: true };
  }
}