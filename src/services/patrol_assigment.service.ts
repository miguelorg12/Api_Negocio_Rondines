import { AppDataSource } from "@configs/data-source";
import { PatrolAssignment } from "@interfaces/entity/patrol_assigment.entity";
import { PatrolRecordService } from "@services/patrol_record.service";
import { Checkpoint } from "@interfaces/entity/checkpoint.entity";
import { Patrol } from "@interfaces/entity/patrol.entity";
import {
  PatrolAssignmentDto,
  PartialPatrolAssignmentDto,
  RouteAssignmentWithCheckpointsDto,
} from "@interfaces/dto/patrol_assigment.dto";
import { Repository } from "typeorm";

export class PatrolAssignmentService {
  private patrolAssignmentRepository: Repository<PatrolAssignment>;
  private patrolRecordService: PatrolRecordService;
  private checkpointRepository: Repository<Checkpoint>;
  private patrolRepository: Repository<Patrol>;

  constructor() {
    this.patrolAssignmentRepository =
      AppDataSource.getRepository(PatrolAssignment);
    this.patrolRecordService = new PatrolRecordService();
    this.checkpointRepository = AppDataSource.getRepository(Checkpoint);
    this.patrolRepository = AppDataSource.getRepository(Patrol);
  }

  async create(
    patrolAssignmentDto: PatrolAssignmentDto
  ): Promise<PatrolAssignment> {
    const patrolAssignment =
      this.patrolAssignmentRepository.create(patrolAssignmentDto);

    const savedAssignment = await this.patrolAssignmentRepository.save(
      patrolAssignment
    );

    // Crear el registro de patrol asociado al PatrolAssignment
    await this.patrolRecordService.create({
      date: patrolAssignmentDto.date,
      status: "pendiente",
      patrol_assignment_id: savedAssignment.id,
    });

    return savedAssignment;
  }

  /**
   * Crear asignación de ruta con 4 checkpoints automáticos
   */
  async createRouteWithCheckpoints(
    routeData: RouteAssignmentWithCheckpointsDto
  ): Promise<PatrolAssignment> {
    // Obtener el patrol con su plan
    const patrol = await this.patrolRepository.findOne({
      where: { id: routeData.patrol_id },
      relations: ["plans"],
    });

    if (!patrol) {
      throw new Error("Patrol no encontrado");
    }

    if (!patrol.plans || patrol.plans.length === 0) {
      throw new Error("El patrol seleccionado no tiene un plan asignado");
    }

    const plan = patrol.plans[0]; // Usar el primer plan del patrol

    // Crear la asignación de patrol
    const patrolAssignment = this.patrolAssignmentRepository.create({
      user: { id: routeData.user_id },
      patrol: { id: routeData.patrol_id },
      shift: { id: routeData.shift_id },
      date: routeData.date,
    });

    const savedAssignment = await this.patrolAssignmentRepository.save(
      patrolAssignment
    );

    // Crear checkpoints con los datos enviados desde el frontend
    const checkpoints = [];
    for (let i = 0; i < routeData.checkpoints.length; i++) {
      const checkpointData = routeData.checkpoints[i];
      const checkpoint = this.checkpointRepository.create({
        name: checkpointData.name,
        nfc_uid: `NFC_CHECKPOINT_${i + 1}`, // Hardcoded NFC UID
        time: checkpointData.time, // Usar el tiempo enviado desde el frontend
        plan: { id: plan.id },
      });

      const savedCheckpoint = await this.checkpointRepository.save(checkpoint);
      checkpoints.push(savedCheckpoint);
    }

    // Crear el registro de patrol asociado al PatrolAssignment
    console.log(
      "Creando PatrolRecord con patrol_assignment_id:",
      savedAssignment.id
    );
    const patrolRecord = await this.patrolRecordService.create({
      date: routeData.date, // Usar la misma fecha del assignment
      status: "pendiente",
      patrol_assignment_id: savedAssignment.id,
    });

    console.log("PatrolRecord creado:", patrolRecord);

    return savedAssignment;
  }

  async getAll(): Promise<PatrolAssignment[]> {
    return await this.patrolAssignmentRepository.find({
      relations: ["user", "patrol", "shift"],
    });
  }

  async getById(id: number): Promise<PatrolAssignment | null> {
    return await this.patrolAssignmentRepository.findOne({
      where: { id },
      relations: ["user", "patrol", "shift", "patrolRecords"],
    });
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
