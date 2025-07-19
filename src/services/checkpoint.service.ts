import { AppDataSource } from "@configs/data-source";
import {
  CheckPointDto,
  PartialCheckPointDto,
} from "@interfaces/dto/checkpoint.dto";
import { Checkpoint } from "@interfaces/entity/checkpoint.entity";

export class CheckpointService {
  private checkpointRepository = AppDataSource.getRepository(Checkpoint);

  async findAll(): Promise<Checkpoint[]> {
    return await this.checkpointRepository.find();
  }

  async create(checkpoint: CheckPointDto): Promise<Checkpoint> {
    return await this.checkpointRepository.save(checkpoint);
  }

  async findById(id: number): Promise<Checkpoint | null> {
    return await this.checkpointRepository.findOne({
      where: { id },
    });
  }

  async update(
    id: number,
    checkpointData: PartialCheckPointDto
  ): Promise<Checkpoint | null> {
    const checkpoint = await this.findById(id);
    if (!checkpoint) {
      throw new Error("Checkpoint no encontrado");
    }
    await this.checkpointRepository.update(id, checkpointData);
    return this.findById(id);
  }

  async delete(id: number): Promise<Checkpoint | null> {
    const checkpoint = await this.findById(id);
    if (!checkpoint) {
      throw new Error("Checkpoint no encontrado");
    }
    await this.checkpointRepository.softDelete({ id });
    return checkpoint;
  }
}
