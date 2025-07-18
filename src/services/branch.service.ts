import { AppDataSource } from "@configs/data-source";
import { Branch } from "@interfaces/entity/branch.entity";
import { Repository } from "typeorm";
import { PartialBranchDto, CreateBranchDto } from "@interfaces/dto/branch.dto";

export class BranchService {
  private branchRepository: Repository<Branch>;

  constructor() {
    this.branchRepository = AppDataSource.getRepository(Branch);
  }

  async create(createBranchDto: CreateBranchDto): Promise<Branch> {
    return await this.branchRepository.save(createBranchDto);
  }

  async findAll(): Promise<Branch[]> {
    return await this.branchRepository.find();
  }

  async findById(id: number): Promise<Branch | null> {
    return await this.branchRepository.findOneBy({ id });
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
}
