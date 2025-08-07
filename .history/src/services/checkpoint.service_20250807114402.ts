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
      throw new Error("No tienes un turno en progreso");
    }

    // 2. Validar que el checkpoint existe y obtener su información
    const targetCheckpoint = await this.checkpointRepository.findOne({
      where: { id: checkpoint_id },
      relations: ["branch"],
    });

    if (!targetCheckpoint) {
      throw new Error("El checkpoint no existe");
    }

    // 3. Validar que el checkpoint pertenece a una de las sucursales del usuario
    const userBranches = await AppDataSource.getRepository(Branch)
      .createQueryBuilder("branch")
      .innerJoin("branch.guards", "user")
      .where("user.id = :userId", { userId: user_id })
      .getMany();
    
    const userBranchIds = userBranches.map(branch => branch.id);
    if (!userBranchIds.includes(targetCheckpoint.branch.id)) {
      throw new Error("No puedes marcar checkpoints de otra sucursal");
    }

    // 4. Validar que el checkpoint está en la ruta del usuario
    const routePoint = currentPatrolForUser.patrol.routePoints.find(
      (rp) => rp.checkpoint.id === checkpoint_id
    );

    if (!routePoint) {
      throw new Error("Este checkpoint no está en tu ruta asignada");
    }

    // 5. Validar la secuencia de checkpoints
    const completedCheckpoints = await this.checkpointRecordRepository.find({
      where: {
        patrolAssignment: { id: currentPatrolForUser.id },
        status: ["completed", "late"],
      },
      relations: ["checkpoint"],
      order: { created_at: "ASC" },
    });

    const completedCheckpointIds = completedCheckpoints.map(cr => cr.checkpoint.id);
    const routePointOrder = routePoint.order;
    
    // Verificar que todos los checkpoints anteriores ya fueron completados
    const previousRoutePoints = currentPatrolForUser.patrol.routePoints.filter(
      rp => rp.order < routePointOrder
    );

    for (const prevRoutePoint of previousRoutePoints) {
      if (!completedCheckpointIds.includes(prevRoutePoint.checkpoint.id)) {
        throw new Error(`Debes completar el checkpoint "${prevRoutePoint.checkpoint.name}" primero`);
      }
    }

    // 6. Buscar el checkpoint record existente
    const existingCheckpointRecord = await this.checkpointRecordRepository.findOne({
      where: {
        patrolAssignment: { id: currentPatrolForUser.id },
        checkpoint: { id: checkpoint_id },
      },
    });

    if (existingCheckpointRecord && existingCheckpointRecord.status === "completed") {
      throw new Error("Este checkpoint ya fue completado");
    }

    // 7. Calcular el status basado en el tiempo
    const now = new Date();
    const checkTime = existingCheckpointRecord?.check_time || new Date();
    const timeDifference = Math.abs(now.getTime() - checkTime.getTime()) / (1000 * 60); // diferencia en minutos

    let status: "completed" | "late" = "completed";
    
    if (timeDifference > 5) {
      status = "late";
    }

    // 8. Actualizar o crear el checkpoint record
    if (existingCheckpointRecord) {
      existingCheckpointRecord.real_check = now;
      existingCheckpointRecord.status = status;
      await this.checkpointRecordRepository.save(existingCheckpointRecord);
    } else {
      const checkpointRecord = this.checkpointRecordRepository.create({
        patrolAssignment: { id: currentPatrolForUser.id },
        checkpoint: { id: checkpoint_id },
        check_time: checkTime,
        real_check: now,
        status: status,
      });
      await this.checkpointRecordRepository.save(checkpointRecord);
    }

    return {
      checkpoint: targetCheckpoint,
      status: status,
      message: status === "completed" ? "Checkpoint marcado correctamente" : "Checkpoint marcado con retraso",
      timeDifference: Math.round(timeDifference),
    };
  }
}
