import { Global, Module } from "@nestjs/common";
import { CacheModule } from "@nestjs/cache-manager";
import { CacheService } from "./cache.service";
import * as redisStore from "cache-manager-ioredis";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { CacheController } from "./cache.controller";

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get("REDIS_HOST"),
        port: configService.get("REDIS_PORT"),
        ttl: configService.get("CACHE_TTL") || 3600, // Default 60 seconds
      }),
    }),
  ],
  providers: [CacheService],
  controllers: [CacheController],
  exports: [CacheModule, CacheService],
})
export class RedisCacheModule {}
