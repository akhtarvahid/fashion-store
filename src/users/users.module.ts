import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { UserEntity } from "./user.entity";
import { EmailRateLimitGuard } from "../rate-limiting/email-rate-limit.guard";

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [UsersController],
  providers: [UsersService, EmailRateLimitGuard],
  exports: [UsersService], // to make it available in other modules
})
export class UsersModule {}
