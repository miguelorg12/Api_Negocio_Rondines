import { AppDataSource } from "@configs/data-source";
import { PatrolAssignment } from "@interfaces/entity/patrol_assigment.entity";
import { PatrolRecordService } from "@services/patrol_record.service";
import { Checkpoint } from "@interfaces/entity/checkpoint.entity";
import { Patrol } from "@interfaces/entity/patrol.entity";
import {
  PatrolAssignmentDto,
  PartialPatrolAssignmentDto,
  RouteAssignmentWithCheckpointsDto,
  UpdateRouteWithCheckpointsDto,
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

  /**
   * Actualizar asignación de ruta con checkpoints
   */
  async updateRouteWithCheckpoints(
    id: number,
    updateData: UpdateRouteWithCheckpointsDto
  ): Promise<PatrolAssignment> {
    // Verificar que la asignación existe
    const existingAssignment = await this.patrolAssignmentRepository.findOne({
      where: { id },
      relations: ["user", "patrol", "shift"],
    });

    if (!existingAssignment) {
      throw new Error("Asignación de ruta no encontrada");
    }

    // Si se va a actualizar el patrol_id, verificar que tenga plan
    if (
      updateData.patrol_id &&
      updateData.patrol_id !== existingAssignment.patrol.id
    ) {
      const patrol = await this.patrolRepository.findOne({
        where: { id: updateData.patrol_id },
        relations: ["plans"],
      });

      if (!patrol) {
        throw new Error("Patrol no encontrado");
      }

      if (!patrol.plans || patrol.plans.length === 0) {
        throw new Error("El patrol seleccionado no tiene un plan asignado");
      }
    }

    // Actualizar la asignación de patrol
    const updateFields: any = {};
    if (updateData.user_id) updateFields.user = { id: updateData.user_id };
    if (updateData.patrol_id)
      updateFields.patrol = { id: updateData.patrol_id };
    if (updateData.shift_id) updateFields.shift = { id: updateData.shift_id };
    if (updateData.date) updateFields.date = updateData.date;

    await this.patrolAssignmentRepository.update(id, updateFields);

    // Si se van a actualizar los checkpoints
    if (updateData.checkpoints && updateData.checkpoints.length > 0) {
      // Obtener el plan del patrol (nuevo o existente)
      const patrolId = updateData.patrol_id || existingAssignment.patrol.id;
      const patrol = await this.patrolRepository.findOne({
        where: { id: patrolId },
        relations: ["plans"],
      });

      if (!patrol || !patrol.plans || patrol.plans.length === 0) {
        throw new Error("El patrol no tiene un plan asignado");
      }

      const plan = patrol.plans[0];

      // Eliminar checkpoints existentes del plan
      await this.checkpointRepository.delete({ plan: { id: plan.id } });

      // Crear nuevos checkpoints
      const checkpoints = [];
      for (let i = 0; i < updateData.checkpoints.length; i++) {
        const checkpointData = updateData.checkpoints[i];
        const checkpoint = this.checkpointRepository.create({
          name: checkpointData.name,
          nfc_uid: `NFC_CHECKPOINT_${i + 1}`,
          time: checkpointData.time,
          plan: { id: plan.id },
        });

        const savedCheckpoint = await this.checkpointRepository.save(
          checkpoint
        );
        checkpoints.push(savedCheckpoint);
      }
    }

    // Actualizar el PatrolRecord si se cambió la fecha
    if (updateData.date) {
      const patrolRecord = await this.patrolRecordService.findByAssigmentId(id);
      if (patrolRecord) {
        await this.patrolRecordService.update(patrolRecord.id, {
          date: updateData.date,
        });
      }
    }

    return await this.getById(id);
  }

  /**
   * Eliminar asignación de ruta con checkpoints
   */
  async deleteRouteWithCheckpoints(id: number): Promise<PatrolAssignment> {
    // Verificar que la asignación existe
    const existingAssignment = await this.patrolAssignmentRepository.findOne({
      where: { id },
      relations: ["user", "patrol", "shift", "patrolRecords"],
    });

    if (!existingAssignment) {
      throw new Error("Asignación de ruta no encontrada");
    }

    // Eliminar checkpoints asociados al plan del patrol
    const patrol = await this.patrolRepository.findOne({
      where: { id: existingAssignment.patrol.id },
      relations: ["plans"],
    });

    if (patrol && patrol.plans && patrol.plans.length > 0) {
      const plan = patrol.plans[0];
      await this.checkpointRepository.delete({ plan: { id: plan.id } });
    }

    // Eliminar registros de patrol asociados
    if (existingAssignment.patrolRecords) {
      for (const record of existingAssignment.patrolRecords) {
        await this.patrolRecordService.delete(record.id);
      }
    }

    // Soft delete de la asignación
    await this.patrolAssignmentRepository.softDelete(id);

    return existingAssignment;
  }
}
