import { Test, TestingModule } from "@nestjs/testing";
import { UsersController } from "../users.controller";
import { UsersService } from "../users.service";
import { UserEntity as User } from "../user.entity";
import { CreateUserDto, UpdateUserDto } from "../dto";
import { EmailRateLimitGuard } from "../../rate-limiting/email-rate-limit.guard";
import { LoginUserDto } from "../dto/login-user.dto";

// mock of EmailRateLimitGuard
jest.mock("../../rate-limiting/email-rate-limit.guard.ts", () => ({
  EmailRateLimitGuard: jest.fn().mockImplementation(() => ({
    canActivate: jest.fn().mockResolvedValue(true),
    getTtl: jest.fn().mockRejectedValue(60000),
  })),
}));

describe("UsersController", () => {
  let controller: UsersController;
  let usersService: UsersService;

  // Mock User data
  const mockUser: User = {
    id: "1",
    email: "test@example.com",
    password: "hashedPassword",
    firstName: "First name",
    lastName: "Last name",
    isActive: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            register: jest.fn().mockResolvedValue(mockUser),
            login: jest.fn().mockResolvedValue(mockUser),
            findAll: jest.fn().mockResolvedValue([mockUser]),
            findOne: jest.fn().mockResolvedValue(mockUser),
            update: jest.fn().mockResolvedValue(mockUser),
            remove: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    })
      .overrideGuard(EmailRateLimitGuard) // Bypass rate-limiting in tests
      .useValue({ canActivate: () => true, getTtl: () => 60000 })
      .compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("register", () => {
    it("should register a new user", async () => {
      const createUserDto: CreateUserDto = {
        email: "test@example.com",
        password: "password123",
      };
      const result = await controller.register(createUserDto);
      expect(usersService.register).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(mockUser);
    });
  });

  describe("login", () => {
    it("should log in a user", async () => {
      const loginDto: LoginUserDto = {
        email: "test@example.com",
        password: "password123",
      };
      const result = await controller.login(loginDto);
      expect(usersService.login).toHaveBeenCalledWith(loginDto);

      console.log("loginDto:  ", loginDto);

      expect(result.email).toEqual(mockUser.email);
    });
  });

  describe("findAll", () => {
    it("should return an array of users", async () => {
      const result = await controller.findAll();

      console.log("findAll result:  ", result);

      expect(usersService.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockUser]);
    });
  });

  describe("findOne", () => {
    it("should return a user by id", async () => {
      const result = await controller.findOne("1");
      expect(usersService.findOne).toHaveBeenCalledWith("1");
      expect(result).toEqual(mockUser);
    });
  });

  describe("update", () => {
    it("should update a user", async () => {
      const updateUserDto: UpdateUserDto = { email: "updatedUserEmail" };
      const result = await controller.update("1", updateUserDto);
      expect(usersService.update).toHaveBeenCalledWith("1", updateUserDto);
      expect(result).toEqual(mockUser);
    });
  });

  describe("remove", () => {
    it("should delete a user", async () => {
      await controller.remove("1");
      expect(usersService.remove).toHaveBeenCalledWith("1");
    });
  });
});
