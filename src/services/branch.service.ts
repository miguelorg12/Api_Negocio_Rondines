import { AppDataSource } from "@configs/data-source";
import { Branch } from "@interfaces/entity/branch.entity";
import { Repository } from "typeorm";
import { PartialBranchDto, CreateBranchDto } from "@interfaces/dto/branch.dto";
import { User } from "@interfaces/entity/user.entity";

export class BranchService {
  private branchRepository: Repository<Branch>;
  private userRepository: Repository<User>;
  constructor() {
    this.branchRepository = AppDataSource.getRepository(Branch);
    this.userRepository = AppDataSource.getRepository(User);
  }

  async create(createBranchDto: CreateBranchDto): Promise<Branch> {
    return await this.branchRepository.save(createBranchDto);
  }

  async findAll(): Promise<Branch[]> {
    return await this.branchRepository.find({
      relations: ["user", "company"],
    });
  }

  async findById(id: number): Promise<Branch | null> {
    return await this.branchRepository.findOne({
      where: { id },
      relations: ["user", "company"],
    });
  }

  async update(
    id: number,
    updateData: PartialBranchDto
  ): Promise<Branch | null> {
    const branch = await this.findById(id);
    if (!branch) {
      throw new Error("Branch not found");
    }
    await this.branchRepository.update(id, updateData);
    return this.findById(id);
  }

  async delete(id: number): Promise<Branch | null> {
    const branch = await this.findById(id);
    if (!branch) {
      throw new Error("Branch not found");
    }
    await this.branchRepository.softDelete(id);
    return branch;
  }

  async userOwnerToBranch(
    branchId: number,
    userId: number
  ): Promise<Branch | null> {
    const branch = await this.findById(branchId);
    if (!branch) {
      throw new Error("Branch not found");
    }
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error("User not found");
    }
    branch.user = user;
    return await this.branchRepository.save(branch);
  }
}
