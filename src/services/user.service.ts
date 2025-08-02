import { AppDataSource } from "@configs/data-source";
import { CreateUserDto, PartialCreateUserDto } from "@dto/user.dto";
import { User } from "@entities/user.entity";
import { Branch } from "@interfaces/entity/branch.entity";
import { Repository } from "typeorm";
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
    let newUser = this.userRepository.create({
      ...user,
      role: { id: user.role_id },
    });
    console.log(user.role_id);

    const userSaved = await this.userRepository.save(newUser);
    if (user.role_id !== 4) {
      await this.branchService.userOwnerToBranch(user.branch_id, userSaved.id);
    } else {
      const branch = await this.branchRepository.findOne({
        where: { id: user.branch_id },
      });
      console.log(branch);

      userSaved.branches = [branch];
      await this.userRepository.save(userSaved);
    }
    return userSaved;
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

    // Update user data
    await this.userRepository.update(id, userData);

    // Handle branch assignment logic similar to create
    if (userData.role_id !== undefined) {
      const updatedUser = await this.findById(id);
      if (!updatedUser) {
        throw new Error("Error al actualizar usuario");
      }

      if (userData.role_id !== 4) {
        // For non-guard roles, assign user as owner to branch
        if (userData.branch_id !== undefined) {
          await this.branchService.userOwnerToBranch(
            userData.branch_id,
            updatedUser.id
          );
        }
      } else {
        // For guard role (role_id = 4), assign branch directly
        if (userData.branch_id !== undefined) {
          const branch = await this.branchRepository.findOne({
            where: { id: userData.branch_id },
          });
          console.log(branch);

          if (branch) {
            updatedUser.branches = [branch];
            await this.userRepository.save(updatedUser);
          }
        }
      }
    }

    return this.findById(id);
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
}
