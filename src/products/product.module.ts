import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductsService } from "./product.service";
import { ProductsController } from "./product.controller";
import { Product } from "./entities/product.entity";
import { CacheService } from "src/cache/cache.service";

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [ProductsController],
  providers: [ProductsService, CacheService],
})
export class ProductsModule {}
