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
      network: { id: checkpointDto.network_id },
    });
    return await this.checkpointRepository.save(checkpoint);
  }

  async getAll(): Promise<Checkpoint[]> {
    return await this.checkpointRepository.find({
      relations: ["branch", "network"],
    });
  }

  async getById(id: number): Promise<Checkpoint | null> {
    return await this.checkpointRepository.findOne({
      where: { id },
      relations: ["branch", "network"],
    });
  }

  async getByBranchId(branchId: number): Promise<Checkpoint[]> {
    return await this.checkpointRepository.find({
      where: { branch: { id: branchId } },
      relations: ["branch", "network"],
    });
  }

  async getByNetworkId(networkId: number): Promise<Checkpoint[]> {
    return await this.checkpointRepository.find({
      where: { network: { id: networkId } },
      relations: ["branch", "network"],
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
    if (checkpointDto.network_id)
      updateData.network = { id: checkpointDto.network_id };

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

  async markChekpointPatrol(user_id: number, checkpoint_id: number) {
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

    const userBranchIds = userBranches.map((branch) => branch.id);
    if (!userBranchIds.includes(targetCheckpoint.branch.id)) {
      throw new Error(
        "El checkpoint no pertenece a una sucursal asignada al usuario"
      );
    }

    // 4. Validar que el checkpoint está en la ruta del patrol assignment
    const routePoint = currentPatrolForUser.patrol.routePoints.find(
      (rp) => rp.checkpoint.id === checkpoint_id
    );

    if (!routePoint) {
      throw new Error("El checkpoint no está en la ruta asignada al usuario");
    }

    // 5. Buscar el checkpoint record existente o crear uno nuevo
    let checkpointRecord = await this.checkpointRecordRepository.findOne({
      where: {
        patrolAssignment: { id: currentPatrolForUser.id },
        checkpoint: { id: checkpoint_id },
      },
    });

    // Si no existe el checkpoint record, lo creamos
    if (!checkpointRecord) {
      // Obtener todos los checkpoint records existentes para esta asignación
      const existingCheckpointRecords =
        await this.checkpointRecordRepository.find({
          where: {
            patrolAssignment: { id: currentPatrolForUser.id },
          },
          relations: ["checkpoint"],
          order: { created_at: "ASC" },
        });

      // Si no hay ningún checkpoint record, este es el primero
      if (existingCheckpointRecords.length === 0) {
        checkpointRecord = this.checkpointRecordRepository.create({
          patrolAssignment: currentPatrolForUser,
          checkpoint: targetCheckpoint,
          status: "pending",
        });
      } else {
        // Verificar si ya completamos todos los checkpoints y podemos reiniciar
        const allCheckpointsCompleted = existingCheckpointRecords.every(
          (cr) => cr.status === "completed" || cr.status === "late"
        );

        if (allCheckpointsCompleted) {
          // Reiniciar el ciclo - crear nuevo checkpoint record
          checkpointRecord = this.checkpointRecordRepository.create({
            patrolAssignment: currentPatrolForUser,
            checkpoint: targetCheckpoint,
            status: "pending",
          });
        } else {
          // Verificar el orden de los checkpoints
          const nextExpectedCheckpoint = this.getNextExpectedCheckpoint(
            currentPatrolForUser.patrol.routePoints,
            existingCheckpointRecords
          );

          if (
            nextExpectedCheckpoint &&
            nextExpectedCheckpoint.checkpoint.id !== checkpoint_id
          ) {
            throw new Error(
              `Debe completar el checkpoint ${nextExpectedCheckpoint.checkpoint.name} antes de continuar`
            );
          }

          // Crear el checkpoint record para el checkpoint actual
          checkpointRecord = this.checkpointRecordRepository.create({
            patrolAssignment: currentPatrolForUser,
            checkpoint: targetCheckpoint,
            status: "pending",
          });
        }
      }
    } else {
      // El checkpoint record ya existe, verificar que no haya sido marcado previamente
      if (checkpointRecord.real_check) {
        throw new Error("Este checkpoint ya fue marcado anteriormente");
      }

      // Verificar el orden de los checkpoints
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

      if (
        nextExpectedCheckpoint &&
        nextExpectedCheckpoint.checkpoint.id !== checkpoint_id
      ) {
        throw new Error(
          `Debe completar el checkpoint ${nextExpectedCheckpoint.checkpoint.name} antes de continuar`
        );
      }
    }

    // 6. Marcar el checkpoint como completado
    const currentTime = new Date();
    const status: "completed" = "completed";

    // 7. Actualizar o guardar el checkpoint record
    checkpointRecord.real_check = currentTime;
    checkpointRecord.status = status;

    await this.checkpointRecordRepository.save(checkpointRecord);

    return {
      checkpoint: targetCheckpoint,
      status: status,
      real_check: currentTime,
      message: "Checkpoint completado exitosamente",
    };
  }

  private getNextExpectedCheckpoint(
    routePoints: any[],
    completedCheckpoints: any[]
  ): any | null {
    const sortedRoutePoints = routePoints.sort((a, b) => a.order - b.order);
    const completedCheckpointIds = completedCheckpoints.map(
      (cc) => cc.checkpoint.id
    );

    for (const routePoint of sortedRoutePoints) {
      if (!completedCheckpointIds.includes(routePoint.checkpoint.id)) {
        return routePoint;
      }
    }

    return null; // Todos los checkpoints están completados
  }
}
