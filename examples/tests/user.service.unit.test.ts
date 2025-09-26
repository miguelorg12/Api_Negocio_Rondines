// EJEMPLO PRÁCTICO: Prueba Unitaria para UserService
// Este archivo muestra cómo implementar pruebas unitarias para src/services/user.service.ts

import { UserService } from '../../src/services/user.service';
import { User } from '../../src/interfaces/entity/user.entity';
import { CreateUserDto } from '../../src/interfaces/dto/user.dto';
import { Repository } from 'typeorm';

// Mock del repositorio
jest.mock('../../src/configs/data-source');

describe('UserService - Unit Tests', () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<Repository<User>>;
  let mockBranchRepository: jest.Mocked<any>;

  beforeEach(() => {
    // Configurar mocks
    mockUserRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    mockBranchRepository = {
      findByIds: jest.fn(),
    } as any;

    userService = new UserService();
    // Inyectar mocks (en implementación real se usaría dependency injection)
    (userService as any).userRepository = mockUserRepository;
    (userService as any).branchRepository = mockBranchRepository;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all users with relations', async () => {
      // Arrange
      const expectedUsers = [
        { id: 1, name: 'Juan Pérez', email: 'juan@test.com' },
        { id: 2, name: 'María García', email: 'maria@test.com' }
      ];
      mockUserRepository.find.mockResolvedValue(expectedUsers as User[]);

      // Act
      const result = await userService.findAll();

      // Assert
      expect(mockUserRepository.find).toHaveBeenCalledWith({
        relations: ['role', 'branch']
      });
      expect(result).toEqual(expectedUsers);
    });

    it('should handle empty result', async () => {
      // Arrange
      mockUserRepository.find.mockResolvedValue([]);

      // Act
      const result = await userService.findAll();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('should create user with valid data', async () => {
      // Arrange
      const userData: CreateUserDto = {
        name: 'Nuevo Usuario',
        email: 'nuevo@test.com',
        role_id: 2,
        branch_ids: [1, 2]
      };

      const createdUser = { id: 1, ...userData };
      const savedUser = { id: 1, ...userData, created_at: new Date() };

      mockUserRepository.create.mockReturnValue(createdUser as User);
      mockUserRepository.save.mockResolvedValue(savedUser as User);

      // Act
      const result = await userService.create(userData);

      // Assert
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        ...userData,
        role: { id: userData.role_id }
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith(createdUser);
      expect(result).toEqual(savedUser);
    });

    it('should throw error when repository fails', async () => {
      // Arrange
      const userData: CreateUserDto = {
        name: 'Usuario Error',
        email: 'error@test.com',
        role_id: 1
      };

      mockUserRepository.create.mockReturnValue({} as User);
      mockUserRepository.save.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(userService.create(userData)).rejects.toThrow('Database error');
    });
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      // Arrange
      const userId = 1;
      const expectedUser = { 
        id: userId, 
        name: 'Juan Pérez', 
        email: 'juan@test.com',
        role: { id: 1, name: 'Admin' },
        branch: { id: 1, name: 'Sucursal Central' }
      };
      mockUserRepository.findOne.mockResolvedValue(expectedUser as User);

      // Act
      const result = await userService.findById(userId);

      // Assert
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ['role', 'branch']
      });
      expect(result).toEqual(expectedUser);
    });

    it('should return null when user not found', async () => {
      // Arrange
      const userId = 999;
      mockUserRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await userService.findById(userId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update existing user', async () => {
      // Arrange
      const userId = 1;
      const updateData = { name: 'Nombre Actualizado' };
      const existingUser = { id: userId, name: 'Nombre Original', email: 'test@test.com' };
      const updatedUser = { ...existingUser, ...updateData };

      mockUserRepository.findOne.mockResolvedValue(existingUser as User);
      mockUserRepository.save.mockResolvedValue(updatedUser as User);

      // Act
      const result = await userService.update(userId, updateData);

      // Assert
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ['role', 'branch']
      });
      expect(result).toEqual(updatedUser);
    });

    it('should throw error when user not found', async () => {
      // Arrange
      const userId = 999;
      const updateData = { name: 'Nuevo Nombre' };
      mockUserRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.update(userId, updateData))
        .rejects.toThrow('Usuario no encontrado');
    });
  });
});