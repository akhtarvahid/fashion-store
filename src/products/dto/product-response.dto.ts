import { IsDate, IsNumber, IsString } from "class-validator";

export class ProductResponseDto {
  @IsNumber()
  readonly id: number;

  @IsString()
  readonly title: string;

  @IsString()
  readonly description: string;

  @IsString()
  readonly category: string;

  @IsString()
  image: string;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;
}
