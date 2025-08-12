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

    // 5. Buscar el checkpoint record existente
    let checkpointRecord = await this.checkpointRecordRepository.findOne({
      where: {
        patrolAssignment: { id: currentPatrolForUser.id },
        checkpoint: { id: checkpoint_id },
      },
    });

    // 6. Validar el orden de los checkpoints antes de continuar
    const existingCheckpointRecords =
      await this.checkpointRecordRepository.find({
        where: {
          patrolAssignment: { id: currentPatrolForUser.id },
          status: In(["completed", "late"]),
        },
        relations: ["checkpoint"],
        order: { created_at: "ASC" },
      });

    // Obtener el orden del checkpoint actual en la ruta
    const currentCheckpointOrder = routePoint.order;

    // Verificar si todos los checkpoints de la ruta están completados
    const allRouteCheckpoints = currentPatrolForUser.patrol.routePoints.map(
      (rp) => rp.checkpoint.id
    );
    const completedCheckpoints = existingCheckpointRecords.map(
      (cr) => cr.checkpoint.id
    );

    const allCheckpointsCompleted = allRouteCheckpoints.every((checkpointId) =>
      completedCheckpoints.includes(checkpointId)
    );

    // Si todos los checkpoints están completados, permitir reiniciar desde cualquier punto
    if (allCheckpointsCompleted) {
      // Reiniciar el ciclo - permitir marcar cualquier checkpoint de nuevo
      // No borrar registros anteriores, solo crear uno nuevo para el actual
      checkpointRecord = this.checkpointRecordRepository.create({
        patrolAssignment: currentPatrolForUser,
        checkpoint: targetCheckpoint,
        status: "completed",
        real_check: new Date(),
      });
    } else {
      // Verificar que todos los checkpoints anteriores estén completados
      const previousCheckpoints = currentPatrolForUser.patrol.routePoints
        .filter((rp) => rp.order < currentCheckpointOrder)
        .map((rp) => rp.checkpoint.id);

      const missingPreviousCheckpoints = previousCheckpoints.filter(
        (checkpointId) => !completedCheckpoints.includes(checkpointId)
      );

      if (missingPreviousCheckpoints.length > 0) {
        // Buscar el nombre del primer checkpoint faltante
        const firstMissingCheckpoint =
          currentPatrolForUser.patrol.routePoints.find(
            (rp) => rp.checkpoint.id === missingPreviousCheckpoints[0]
          );

        throw new Error(
          `Debe completar el checkpoint "${firstMissingCheckpoint?.checkpoint.name}" (orden ${firstMissingCheckpoint?.order}) antes de continuar`
        );
      }

      // 7. Si no existe, crear uno nuevo en estado "completed"
      if (!checkpointRecord) {
        checkpointRecord = this.checkpointRecordRepository.create({
          patrolAssignment: currentPatrolForUser,
          checkpoint: targetCheckpoint,
          status: "completed",
          real_check: new Date(),
        });
      } else {
        // 8. Si ya existe, verificar que no haya sido marcado previamente
        if (checkpointRecord.real_check) {
          throw new Error("Este checkpoint ya fue marcado anteriormente");
        }

        // 9. Actualizar el existente
        checkpointRecord.status = "completed";
        checkpointRecord.real_check = new Date();
      }
    }

    // 10. Guardar el checkpoint record
    await this.checkpointRecordRepository.save(checkpointRecord);

    return {
      checkpoint: targetCheckpoint,
      status: "completed",
      real_check: checkpointRecord.real_check,
      message: "Checkpoint completado exitosamente",
    };
  }
}
