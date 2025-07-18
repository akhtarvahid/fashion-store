import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from "@nestjs/common";
import { ProductsService } from "./product.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { ProductResponseDto } from "./dto/product-response.dto";
@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(): Promise<ProductResponseDto[]> {
    return this.productsService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string): Promise<ProductResponseDto> {
    return this.productsService.findOne(+id);
  }

  @Post()
  create(
    @Body() createProductDto: CreateProductDto
  ): Promise<ProductResponseDto> {
    return this.productsService.create(createProductDto);
  }

  @Put(":id")
  update(
    @Param("id") id: string,
    @Body() updateProductDto: UpdateProductDto
  ): Promise<ProductResponseDto> {
    return this.productsService.update(+id, updateProductDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string): Promise<void> {
    return this.productsService.remove(+id);
  }
}
