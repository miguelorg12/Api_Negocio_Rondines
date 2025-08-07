import { AppDataSource } from "@configs/data-source";
import { Checkpoint } from "@entities/checkpoint.entity";
import {
  CheckpointDto,
  PartialCheckpointDto,
} from "@interfaces/dto/checkpoint.dto";
import { PatrolAssignment } from "@entities/patrol_assigment.entity";
import { CheckpointRecord } from "@entities/checkpoint_record.entity";
import { Repository } from "typeorm";

export class CheckpointService {
  private checkpointRepository: Repository<Checkpoint>;
  private patrolAssignmentRepository: Repository<PatrolAssignment>;
  private checkpointRecordRepository: Repository<CheckpointRecord>;
  constructor() {
    this.checkpointRepository = AppDataSource.getRepository(Checkpoint);
    this.patrolAssignmentRepository =
      AppDataSource.getRepository(PatrolAssignment);
    this.checkpointRecordRepository =
      AppDataSource.getRepository(CheckpointRecord);
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

  async markChekpointPatrol(user_id: number, nfc_uid: number) {
    const currentPatrolForUser = await this.patrolAssignmentRepository.findOne({
      where: {
        user: { id: user_id },
        patrolRecords: { status: "en_progreso" },
      },
      relations: [
        "patrolRecords",
        "patrol",
        "patrol.routePoints",
        "patrol.routePoints.checkpoint",
      ],
    });
    console.log(currentPatrolForUser);
    if (!currentPatrolForUser) {
      throw new Error("No se encontró el recorrido para el usuario");
    }
    const checkpoint = currentPatrolForUser.patrol.routePoints.find(
      (routePoint) => routePoint.checkpoint.nfc_uid === nfc_uid
    );
    if (!checkpoint) {
      throw new Error("No se encontró el checkpoint");
    }
    
    // Buscar el checkpoint record existente para esta asignación y checkpoint
    const existingCheckpointRecord = await this.checkpointRecordRepository.findOne({
      where: {
        patrolAssignment: { id: currentPatrolForUser.id },
        checkpoint: { id: checkpoint.checkpoint.id },
      },
    });

    if (existingCheckpointRecord) {
      // Actualizar el checkpoint record existente
      existingCheckpointRecord.real_check = new Date();
      existingCheckpointRecord.status = "completed";
      await this.checkpointRecordRepository.save(existingCheckpointRecord);
    } else {
      // Crear un nuevo checkpoint record si no existe
      const checkpointRecord = this.checkpointRecordRepository.create({
        patrolAssignment: { id: currentPatrolForUser.id },
        checkpoint: { id: checkpoint.checkpoint.id },
        check_time: new Date(), // Usar la hora actual como check_time
        real_check: new Date(),
        status: "completed",
      });
      await this.checkpointRecordRepository.save(checkpointRecord);
    }

    return checkpoint.checkpoint;
  }
}
