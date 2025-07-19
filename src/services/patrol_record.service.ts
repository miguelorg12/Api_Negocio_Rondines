import { AppDataSource } from "@configs/data-source";
import { PatrolRecord } from "@interfaces/entity/patrol_record.entity";
import {
  PatrolRecordDto,
  PartialPatrolRecordDto,
} from "@interfaces/dto/patrol_record.dto";

export class PatrolRecordService {
  private patrolRecordRepository = AppDataSource.getRepository(PatrolRecord);

  async getAll(): Promise<PatrolRecord[]> {
    return await this.patrolRecordRepository.find();
  }

  async create(dto: PatrolRecordDto): Promise<PatrolRecord> {
    const patrolRecord = this.patrolRecordRepository.create(dto);
    return await this.patrolRecordRepository.save(patrolRecord);
  }

  async findById(id: number): Promise<PatrolRecord | null> {
    return await this.patrolRecordRepository.findOne({
      where: { id },
    });
  }

  async update(
    id: number,
    dto: PartialPatrolRecordDto
  ): Promise<PatrolRecord | null> {
    const patrolRecord = await this.findById(id);
    if (!patrolRecord) {
      throw new Error("Registro de patrulla no encontrado");
    }
    await this.patrolRecordRepository.update(id, dto);
    return this.findById(id);
  }

  async delete(id: number): Promise<PatrolRecord | null> {
    const patrolRecord = await this.findById(id);
    if (!patrolRecord) {
      throw new Error("Registro de patrulla no encontrado");
    }
    await this.patrolRecordRepository.update(id, {
      status: "cancelado",
    });
    return this.findById(id);
  }
}
