import { AppDataSource } from "@configs/data-source";
import { Checkpoint } from "@entities/checkpoint.entity";
import {
  CheckpointDto,
  PartialCheckpointDto,
} from "@interfaces/dto/checkpoint.dto";
import { Repository } from "typeorm";

export class CheckpointService {
  private checkpointRepository: Repository<Checkpoint>;

  constructor() {
    this.checkpointRepository = AppDataSource.getRepository(Checkpoint);
  }

  async create(checkpointDto: CheckpointDto): Promise<Checkpoint> {
    const checkpoint = this.checkpointRepository.create({
      name: checkpointDto.name,
      branch: { id: checkpointDto.branch_id },
    });
    return await this.checkpointRepository.save(checkpoint);
  }

  async getAll(): Promise<Checkpoint[]> {
    return await this.checkpointRepository.find({
      relations: ["branch"],
    });
  }

  async getById(id: number): Promise<Checkpoint | null> {
    return await this.checkpointRepository.findOne({
      where: { id },
      relations: ["branch"],
    });
  }

  async getByBranchId(branchId: number): Promise<Checkpoint[]> {
    return await this.checkpointRepository.find({
      where: { branch: { id: branchId } },
      relations: ["branch"],
    });
  }

  async update(
    id: number,
    checkpointDto: PartialCheckpointDto
  ): Promise<Checkpoint | null> {
    const checkpoint = await this.getById(id);
    if (!checkpoint) {
      throw new Error("Checkpoint no encontrado");
    }

    const updateData: any = {};
    if (checkpointDto.name) updateData.name = checkpointDto.name;
    if (checkpointDto.branch_id)
      updateData.branch = { id: checkpointDto.branch_id };

    await this.checkpointRepository.update(id, updateData);
    return await this.getById(id);
  }

  async delete(id: number): Promise<Checkpoint | null> {
    const checkpoint = await this.getById(id);
    if (!checkpoint) {
      throw new Error("Checkpoint no encontrado");
    }
    await this.checkpointRepository.softDelete(id);
    return checkpoint;
  }
}
