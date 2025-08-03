import { AppDataSource } from "@configs/data-source";
import {
  CreateUserDto,
  PartialCreateUserDto,
  UserDataDto,
} from "@dto/user.dto";
import { User } from "@entities/user.entity";
import { Branch } from "@interfaces/entity/branch.entity";
import { Repository, In } from "typeorm";
import { BranchService } from "./branch.service";

export class UserService {
  private userRepository: Repository<User>;
  private branchRepository: Repository<Branch>;
  private branchService: BranchService;
  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.branchRepository = AppDataSource.getRepository(Branch);
    this.branchService = new BranchService();
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find({
      relations: ["role", "branch"],
    });
  }

  async create(user: CreateUserDto): Promise<User> {
    const newUser = this.userRepository.create({
      ...user,
      role: { id: user.role_id },
    });
    return await this.userRepository.save(newUser);
  }

  async findById(id: number): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id },
      relations: ["role", "branch"],
    });
  }

  async update(
    id: number,
    userData: PartialCreateUserDto
  ): Promise<User | null> {
    const user = await this.findById(id);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }
    const updatedUser = this.userRepository.create({
      ...userData,
      role: { id: userData.role_id },
    });
    return await this.userRepository.save(updatedUser);
  }

  async delete(id: number): Promise<User | null> {
    const user = await this.findById(id);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }
    await this.userRepository.update(id, {
      active: user.active ? false : true,
    });
    return this.findById(id);
  }

  async findAllGuards(): Promise<User[]> {
    return await this.userRepository.find({
      where: { role: { name: "Guard" } },
      relations: ["role"],
    });
  }

  async findGuardById(id: number): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id, role: { name: "Guard" } },
      relations: ["role"],
    });
  }

  async saveBiometricId(id: number, biometric: number): Promise<User | null> {
    const user = await this.findById(id);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }
    user.biometric = biometric;
    return await this.userRepository.save(user);
  }

  async verifyBiometric(biometric: number): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { biometric },
      relations: ["role"],
    });
  }

  async getUsersBySpecificRoles(): Promise<User[]> {
    return await this.userRepository.find({
      where: { role: { id: In([1, 2, 3, 5]) } },
      relations: ["role", "branch", "branches"],
      select: {
        id: true,
        name: true,
        last_name: true,
        curp: true,
        email: true,
        active: true,
        biometric: true,
        created_at: true,
        updated_at: true,
        role: {
          id: true,
          name: true,
        },
        branch: {
          id: true,
          name: true,
        },
        branches: {
          id: true,
          name: true,
        },
      },
    });
  }
}
