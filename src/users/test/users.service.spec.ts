import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UsersService } from '../users.service';
import { UserEntity } from '../user.entity';


describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<UserEntity>;

  const mockUser: UserEntity = {
    id: '1',
    email: 'test@example.com',
    password: 'hashedPassword',
    firstName: 'Test',
    lastName: 'User',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );

    // Mock bcrypt hash
    // jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');
    jest.spyOn(bcrypt, 'hash').mockImplementation(() => 
  Promise.resolve('hashedNewPassword') as Promise<string>
);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const userData = {
        email: 'new@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(userRepository, 'create').mockReturnValue(mockUser);
      jest.spyOn(userRepository, 'save').mockResolvedValue(mockUser);

      const result = await service.register(userData);
      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: userData.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
    });

    it('should throw ConflictException if email exists', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

      await expect(service.register(userData)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    it('should return user if email exists', async () => {
      const loginDto = { email: 'test@example.com', password: 'password123' };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

      const result = await service.login(loginDto);
      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
    });

    it('should throw HttpException if user not found', async () => {
      const loginDto = { email: 'nonexistent@example.com', password: 'password' };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(HttpException);
      await expect(service.login(loginDto)).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      jest.spyOn(userRepository, 'find').mockResolvedValue([mockUser]);

      const result = await service.findAll();
      expect(result).toEqual([mockUser]);
      expect(userRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

      const result = await service.findOne('1');
      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');
      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null if user not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update user data', async () => {
      const updateData = { firstName: 'Updated', password: 'newPassword' };
      const updatedUser = { ...mockUser, ...updateData, password: 'hashedNewPassword' };

      jest.spyOn(service, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(userRepository, 'save').mockResolvedValue(updatedUser);
      jest.spyOn(bcrypt, 'hash').mockResolvedValueOnce('hashedNewPassword' as never);

      const result = await service.update('1', updateData);
      expect(result).toEqual(updatedUser);
      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword', 10);
      expect(userRepository.save).toHaveBeenCalledWith(updatedUser);
    });

    it('should not hash password if not provided', async () => {
      const updateData = { firstName: 'Updated' };

      jest.spyOn(service, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(userRepository, 'save').mockResolvedValue({
        ...mockUser,
        ...updateData,
      });

      await service.update('1', updateData);
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(userRepository, 'remove').mockResolvedValue(mockUser);

      await service.remove('1');
      expect(service.findOne).toHaveBeenCalledWith('1');
      expect(userRepository.remove).toHaveBeenCalledWith(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());

      await expect(service.remove('999')).rejects.toThrow(NotFoundException);
    });
  });
});