import { AppDataSource } from "@configs/data-source";
import { PatrolAssignment } from "@interfaces/entity/patrol_assigment.entity";
import { PatrolRecordService } from "@services/patrol_record.service";
import { Patrol } from "@interfaces/entity/patrol.entity";
import { CheckpointRecord } from "@interfaces/entity/checkpoint_record.entity";
import { PatrolRoutePoint } from "@interfaces/entity/patrol_route_point.entity";
import {
  PatrolAssignmentDto,
  PartialPatrolAssignmentDto,
  UpdateRouteWithCheckpointsDto,
} from "@interfaces/dto/patrol_assigment.dto";
import { Repository } from "typeorm";

export class PatrolAssignmentService {
  private patrolAssignmentRepository: Repository<PatrolAssignment>;
  private patrolRecordService: PatrolRecordService;
  private patrolRepository: Repository<Patrol>;
  private checkpointRecordRepository: Repository<CheckpointRecord>;
  private patrolRoutePointRepository: Repository<PatrolRoutePoint>;

  constructor() {
    this.patrolAssignmentRepository =
      AppDataSource.getRepository(PatrolAssignment);
    this.patrolRecordService = new PatrolRecordService();
    this.patrolRepository = AppDataSource.getRepository(Patrol);
    this.checkpointRecordRepository = AppDataSource.getRepository(CheckpointRecord);
    this.patrolRoutePointRepository = AppDataSource.getRepository(PatrolRoutePoint);
  }

  async create(
    patrolAssignmentDto: PatrolAssignmentDto
  ): Promise<PatrolAssignment> {
    // Validar si el guardia ya tiene una asignación para el día específico
    const assignmentDate = patrolAssignmentDto.date instanceof Date 
      ? patrolAssignmentDto.date 
      : new Date(patrolAssignmentDto.date);
      
    const existingAssignment = await this.patrolAssignmentRepository.findOne({
      where: {
        user: { id: patrolAssignmentDto.user_id },
        date: assignmentDate,
      },
      relations: ["user", "patrol", "shift"],
    });

    if (existingAssignment) {
      const dateString = assignmentDate.toISOString().split("T")[0];
      
      throw new Error(
        `El guardia ya tiene una asignación para el día ${dateString}. No se puede crear otra asignación.`
      );
    }

    const patrolAssignment = this.patrolAssignmentRepository.create({
      user: { id: patrolAssignmentDto.user_id },
      patrol: { id: patrolAssignmentDto.patrol_id },
      shift: { id: patrolAssignmentDto.shift_id },
      date: patrolAssignmentDto.date instanceof Date ? patrolAssignmentDto.date : new Date(patrolAssignmentDto.date),
    });

    const savedAssignment = await this.patrolAssignmentRepository.save(
      patrolAssignment
    );

    // Crear el registro de patrol asociado al PatrolAssignment
    await this.patrolRecordService.create({
      date: patrolAssignmentDto.date instanceof Date ? patrolAssignmentDto.date : new Date(patrolAssignmentDto.date),
      status: "pendiente",
      patrol_assignment_id: savedAssignment.id,
    });

    // Crear los checkpoint records automáticamente
    await this.createCheckpointRecordsForAssignment(savedAssignment.id);

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
      relations: [
        "user",
        "patrol",
        "shift",
        "patrolRecords",
        "patrol.routePoints",
        "patrol.routePoints.checkpoint",
      ],
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
    
    // Eliminar los checkpoint records asociados
    await this.checkpointRecordRepository.softDelete({ patrolAssignment: { id } });
    
    await this.patrolRecordService.delete(id);
    await this.patrolAssignmentRepository.softDelete(id);
    return patrolAssigment;
  }

  /**
   * Actualizar asignación de ruta
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

    // Si se va a actualizar el patrol_id, verificar que exista
    if (
      updateData.patrol_id &&
      updateData.patrol_id !== existingAssignment.patrol.id
    ) {
      const patrol = await this.patrolRepository.findOne({
        where: { id: updateData.patrol_id },
      });

      if (!patrol) {
        throw new Error("Patrol no encontrado");
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
   * Eliminar asignación de ruta
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

    // Eliminar registros de patrol asociados
    if (existingAssignment.patrolRecords) {
      for (const record of existingAssignment.patrolRecords) {
        await this.patrolRecordService.delete(record.id);
      }
    }

    // Eliminar los checkpoint records asociados
    await this.checkpointRecordRepository.softDelete({ patrolAssignment: { id } });

    // Soft delete de la asignación
    await this.patrolAssignmentRepository.softDelete(id);

    return existingAssignment;
  }

  /**
   * Crear checkpoint records automáticamente para una asignación de patrulla
   */
  private async createCheckpointRecordsForAssignment(assignmentId: number): Promise<void> {
    // Obtener la asignación con todas las relaciones necesarias
    const assignment = await this.patrolAssignmentRepository.findOne({
      where: { id: assignmentId },
      relations: ["patrol", "patrol.routePoints", "patrol.routePoints.checkpoint", "shift"],
    });

    if (!assignment) {
      throw new Error("Asignación de patrulla no encontrada");
    }

    // Obtener los route points ordenados por el campo 'order'
    const routePoints = await this.patrolRoutePointRepository.find({
      where: { patrol: { id: assignment.patrol.id } },
      relations: ["checkpoint"],
      order: { order: "ASC" },
    });

    if (routePoints.length === 0) {
      console.log(`No hay checkpoints configurados para la patrulla ${assignment.patrol.id}`);
      return;
    }

    // Calcular las horas de verificación basadas en el turno
    const shiftStart = new Date(assignment.shift.start_time);
    const shiftEnd = new Date(assignment.shift.end_time);
    const assignmentDate = new Date(assignment.date);

    // Calcular la duración total del turno en minutos
    let shiftDurationMinutes = (shiftEnd.getTime() - shiftStart.getTime()) / (1000 * 60);
    
    // Manejar el caso del turno nocturno que cruza la medianoche
    if (shiftEnd.getTime() < shiftStart.getTime()) {
      // El turno nocturno cruza la medianoche, sumar 24 horas al final
      const nextDay = new Date(shiftEnd);
      nextDay.setDate(nextDay.getDate() + 1);
      shiftDurationMinutes = (nextDay.getTime() - shiftStart.getTime()) / (1000 * 60);
    }
    
    // Distribuir los checkpoints uniformemente durante el turno
    const timeIntervalMinutes = shiftDurationMinutes / (routePoints.length + 1); // +1 para evitar que el último checkpoint sea al final del turno

    const checkpointRecords = [];

    for (let i = 0; i < routePoints.length; i++) {
      const routePoint = routePoints[i];
      
      // Calcular la hora de verificación para este checkpoint
      const checkTime = new Date(assignmentDate);
      const minutesFromStart = (i + 1) * timeIntervalMinutes; // +1 para que el primer checkpoint no sea al inicio del turno
      
      // Calcular la hora exacta
      const totalMinutes = shiftStart.getMinutes() + minutesFromStart;
      const additionalHours = Math.floor(totalMinutes / 60);
      const finalMinutes = totalMinutes % 60;
      
      checkTime.setHours(
        shiftStart.getHours() + additionalHours,
        finalMinutes,
        0,
        0
      );
      
      // Manejar el caso del turno nocturno que cruza la medianoche
      if (shiftEnd.getTime() < shiftStart.getTime() && checkTime.getHours() < shiftStart.getHours()) {
        checkTime.setDate(checkTime.getDate() + 1);
      }

      const checkpointRecord = this.checkpointRecordRepository.create({
        patrolAssignment: assignment,
        checkpoint: routePoint.checkpoint,
        check_time: checkTime,
        status: "pending",
      });

      checkpointRecords.push(checkpointRecord);
    }

    // Guardar todos los checkpoint records
    if (checkpointRecords.length > 0) {
      await this.checkpointRecordRepository.save(checkpointRecords);
      console.log(`✅ Se crearon ${checkpointRecords.length} checkpoint records para la asignación ${assignmentId}`);
    }
  }
}
