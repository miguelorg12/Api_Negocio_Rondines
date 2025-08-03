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
    const branch = this.branchRepository.create({
      ...createBranchDto,
      user: { id: createBranchDto.user_id },
      company: { id: createBranchDto.company_id },
    });
    return await this.branchRepository.save(branch);
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

    // Update the branch properties
    if (updateData.name !== undefined) branch.name = updateData.name;
    if (updateData.address !== undefined) branch.address = updateData.address;

    // Update relationships if provided
    if (updateData.user_id !== undefined) {
      branch.user = { id: updateData.user_id } as User;
    }
    if (updateData.company_id !== undefined) {
      branch.company = { id: updateData.company_id } as any;
    }

    // Save the updated branch
    return await this.branchRepository.save(branch);
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
