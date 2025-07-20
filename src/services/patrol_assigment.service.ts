import { AppDataSource } from "@configs/data-source";
import { PatrolAssignment } from "@interfaces/entity/patrol_assigment.entity";
import { PatrolRecordService } from "@services/patrol_record.service";
import {
  PatrolAssignmentDto,
  PartialPatrolAssignmentDto,
} from "@interfaces/dto/patrol_assigment.dto";
import { Repository } from "typeorm";

export class PatrolAssignmentService {
  private patrolAssignmentRepository: Repository<PatrolAssignment>;
  private patrolRecordService: PatrolRecordService;

  constructor() {
    this.patrolAssignmentRepository =
      AppDataSource.getRepository(PatrolAssignment);
    this.patrolRecordService = new PatrolRecordService();
  }

  async create(
    patrolAssignmentDto: PatrolAssignmentDto
  ): Promise<PatrolAssignment> {
    const patrolAssignment =
      this.patrolAssignmentRepository.create(patrolAssignmentDto);
    await this.patrolRecordService.create({
      user_id: patrolAssignmentDto.user_id,
      patrol_id: patrolAssignmentDto.patrol_id,
      date: patrolAssignmentDto.date,
      status: "pendiente",
    });
    return await this.patrolAssignmentRepository.save(patrolAssignment);
  }

  async getAll(): Promise<PatrolAssignment[]> {
    return await this.patrolAssignmentRepository.find();
  }

  async getById(id: number): Promise<PatrolAssignment | null> {
    return await this.patrolAssignmentRepository.findOneBy({ id });
  }

  async update(
    id: number,
    partialPatrolAssignmentDto: PartialPatrolAssignmentDto
  ): Promise<PatrolAssignment | null> {
    const patrolAssigment = await this.getById(id);
    if (!patrolAssigment) {
      throw new Error("Ruta asignada no encontrada");
    }
    await this.patrolAssignmentRepository.update(
      id,
      partialPatrolAssignmentDto
    );
    return await this.getById(id);
  }

  async delete(id: number): Promise<PatrolAssignment | null> {
    const patrolAssigment = await this.getById(id);
    if (!patrolAssigment) {
      throw new Error("Ruta asignada no encontrada");
    }
    await this.patrolRecordService.delete(id);
    await this.patrolAssignmentRepository.softDelete(id);
    return patrolAssigment;
  }
}
