import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { getRepositoryToken } from "@nestjs/typeorm";
import { UsersModule } from "../users.module";
import { UsersController } from "../users.controller";
import { UserEntity } from "../user.entity";
import { UsersService } from "../users.service";
import { ThrottlerModule } from "@nestjs/throttler";
import { EmailRateLimitGuard } from "../../rate-limiting/email-rate-limit.guard";

describe("UsersModule", () => {
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        UsersModule,
        // Add ThrottlerModule if needed by your guard
        ThrottlerModule.forRoot([
          {
            ttl: 60000,
            limit: 5,
          },
        ]),
      ],
    })
      // Mock the TypeORM repository
      .overrideProvider(getRepositoryToken(UserEntity))
      .useValue({
        findOne: jest.fn(),
        save: jest.fn(),
        // Add other required repository methods
      })
      // Mock the EmailRateLimitGuard
      .overrideGuard(EmailRateLimitGuard)
      .useValue({
        canActivate: jest.fn().mockReturnValue(true),
      })
      .compile();
  });

  it("should be defined", () => {
    expect(module).toBeDefined();
  });

  it("should provide UsersController", () => {
    const controller = module.get<UsersController>(UsersController);
    expect(controller).toBeDefined();
  });

  it("should provide UsersService", () => {
    const service = module.get<UsersService>(UsersService);
    expect(service).toBeDefined();
  });

  afterAll(async () => {
    await module.close();
  });
});
