import { Module } from "@nestjs/common";
import { CacheService } from "./cache.service";
import { CacheModule } from "@nestjs/cache-manager";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
  imports: [
    CacheModule.register({
      ttl: 5 * 1000, // Cache for 30 * 1000 = 30 seconds (in milliseconds)
      max: 100, // Maximum number of items in cache
      isGlobal: true, // Make cache available across all modules
    }),
    // CacheModule.registerAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: async (configService: ConfigService) => ({
    //     store: redisStore,
    //     host: configService.get('REDIS_HOST'),
    //     port: configService.get('REDIS_PORT'),
    //     ttl: configService.get('CACHE_TTL') || 60,
    //   }),
    // }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class CustomCacheModule {}
