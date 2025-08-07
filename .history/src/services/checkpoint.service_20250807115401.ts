import { AppDataSource } from "@configs/data-source";
import { Checkpoint } from "@entities/checkpoint.entity";
import {
  CheckpointDto,
  PartialCheckpointDto,
} from "@interfaces/dto/checkpoint.dto";
import { PatrolAssignment } from "@entities/patrol_assigment.entity";
import { CheckpointRecord } from "@entities/checkpoint_record.entity";
import { Branch } from "@entities/branch.entity";
import { Repository, In } from "typeorm";

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

  async markChekpointPatrol(user_id: number, nfc_uid: string, checkpoint_id: number) {
    // 1. Validar que el usuario tenga un turno en progreso
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
        "user",
        "shift",
      ],
    });

    if (!currentPatrolForUser) {
      throw new Error("El usuario no tiene un turno en progreso");
    }

    // 2. Validar que el checkpoint existe y obtener su información
    const targetCheckpoint = await this.checkpointRepository.findOne({
      where: { id: checkpoint_id },
      relations: ["branch"],
    });

    if (!targetCheckpoint) {
      throw new Error("El checkpoint especificado no existe");
    }

    // 3. Validar que el checkpoint pertenece a una de las sucursales del usuario
    const userBranches = await AppDataSource.getRepository(Branch)
      .createQueryBuilder("branch")
      .innerJoin("branch.guards", "user")
      .where("user.id = :userId", { userId: user_id })
      .getMany();

    const userBranchIds = userBranches.map(branch => branch.id);
    if (!userBranchIds.includes(targetCheckpoint.branch.id)) {
      throw new Error("El checkpoint no pertenece a una sucursal asignada al usuario");
    }

    // 4. Validar que el checkpoint está en la ruta del patrol assignment
    const routePoint = currentPatrolForUser.patrol.routePoints.find(
      (rp) => rp.checkpoint.id === checkpoint_id
    );

    if (!routePoint) {
      throw new Error("El checkpoint no está en la ruta asignada al usuario");
    }

    // 5. Validar la secuencia de checkpoints
    const completedCheckpoints = await this.checkpointRecordRepository.find({
      where: {
        patrolAssignment: { id: currentPatrolForUser.id },
        status: In(["completed", "late"]),
      },
      relations: ["checkpoint"],
      order: { created_at: "ASC" },
    });

    const nextExpectedCheckpoint = this.getNextExpectedCheckpoint(
      currentPatrolForUser.patrol.routePoints,
      completedCheckpoints
    );

    if (nextExpectedCheckpoint && nextExpectedCheckpoint.checkpoint.id !== checkpoint_id) {
      throw new Error(`Debe completar el checkpoint ${nextExpectedCheckpoint.checkpoint.name} antes de continuar`);
    }

    // 6. Buscar o crear el checkpoint record
    let checkpointRecord = await this.checkpointRecordRepository.findOne({
      where: {
        patrolAssignment: { id: currentPatrolForUser.id },
        checkpoint: { id: checkpoint_id },
      },
    });

    if (!checkpointRecord) {
      throw new Error("No se encontró el registro de checkpoint para esta asignación");
    }

    // 7. Calcular el status basado en el tiempo
    const currentTime = new Date();
    const scheduledTime = checkpointRecord.check_time;
    const timeDifferenceMinutes = (currentTime.getTime() - scheduledTime.getTime()) / (1000 * 60); // diferencia en minutos (positiva = tarde, negativa = temprano)

    let status: "completed" | "late" | "missed" = "completed";
    
    // Si llegaste más de 5 minutos ANTES de la hora programada
    if (timeDifferenceMinutes < -5) {
      throw new Error("No puedes marcar el checkpoint antes de la hora programada");
    }
    
    // Si llegaste más de 15 minutos DESPUÉS de la hora programada
    if (timeDifferenceMinutes > 15) {
      status = "missed";
    }
    // Si llegaste entre 5 y 15 minutos DESPUÉS de la hora programada
    else if (timeDifferenceMinutes > 5) {
      status = "late";
    }
    // Si llegaste dentro de ±5 minutos de la hora programada (incluyendo antes)
    else {
      status = "completed";
    }

    // 8. Actualizar el checkpoint record
    checkpointRecord.real_check = currentTime;
    checkpointRecord.status = status;
    
    await this.checkpointRecordRepository.save(checkpointRecord);

    return {
      checkpoint: targetCheckpoint,
      status: status,
      real_check: currentTime,
      message: status === "completed" 
        ? "Checkpoint completado a tiempo" 
        : status === "late" 
        ? "Checkpoint completado con retraso" 
        : "Checkpoint marcado como perdido"
    };
  }

  private getNextExpectedCheckpoint(
    routePoints: any[],
    completedCheckpoints: any[]
  ): any | null {
    const sortedRoutePoints = routePoints.sort((a, b) => a.order - b.order);
    const completedCheckpointIds = completedCheckpoints.map(cc => cc.checkpoint.id);

    for (const routePoint of sortedRoutePoints) {
      if (!completedCheckpointIds.includes(routePoint.checkpoint.id)) {
        return routePoint;
      }
    }

    return null; // Todos los checkpoints están completados
  }
}
