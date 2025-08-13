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
import { firebaseService } from "./firebase.service";
import { User } from "@entities/user.entity";
import { Shift } from "@entities/shift.entity";

export class PatrolAssignmentService {
  private patrolAssignmentRepository: Repository<PatrolAssignment>;
  private patrolRecordService: PatrolRecordService;
  private patrolRepository: Repository<Patrol>;
  private checkpointRecordRepository: Repository<CheckpointRecord>;
  private patrolRoutePointRepository: Repository<PatrolRoutePoint>;
  private userRepository: Repository<User>;
  private shiftRepository: Repository<Shift>;

  constructor() {
    this.patrolAssignmentRepository =
      AppDataSource.getRepository(PatrolAssignment);
    this.patrolRecordService = new PatrolRecordService();
    this.patrolRepository = AppDataSource.getRepository(Patrol);
    this.checkpointRecordRepository =
      AppDataSource.getRepository(CheckpointRecord);
    this.patrolRoutePointRepository =
      AppDataSource.getRepository(PatrolRoutePoint);
    this.userRepository = AppDataSource.getRepository(User);
    this.shiftRepository = AppDataSource.getRepository(Shift);
  }

  async create(
    patrolAssignmentDto: PatrolAssignmentDto
  ): Promise<PatrolAssignment> {
    // Validar si el guardia ya tiene una asignación para el día específico
    const assignmentDate =
      patrolAssignmentDto.date instanceof Date
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
      date: assignmentDate,
    });

    const savedAssignment = await this.patrolAssignmentRepository.save(
      patrolAssignment
    );

    // Enviar notificación al guardia
    try {
      const user = await this.userRepository.findOne({
        where: { id: patrolAssignmentDto.user_id },
      });
      if (user && user.device_token) {
        const patrol = await this.patrolRepository.findOne({
          where: { id: patrolAssignmentDto.patrol_id },
        });
        const shift = await this.shiftRepository.findOne({
          where: { id: patrolAssignmentDto.shift_id },
        });

        const patrolName = patrol ? patrol.name : "un nuevo rondín";
        const shiftName = shift ? shift.name : "un turno no especificado";
        const guardName = user.name;

        const notificationTitle = "Nuevo Rondín Asignado";
        const notificationBody = `Hola ${guardName}, se te ha asignado el rondín "${patrolName}" para el turno ${shiftName}.`;

        await firebaseService.sendNotification(
          user.device_token,
          notificationTitle,
          notificationBody
        );
      }
    } catch (error) {
      console.error("Error al enviar la notificación:", error);
    }

    // Crear el registro de patrol asociado al PatrolAssignment
    await this.patrolRecordService.create({
      date: assignmentDate,
      status: "pendiente",
      patrol_assignment_id: savedAssignment.id,
    });

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
    await this.checkpointRecordRepository.softDelete({
      patrolAssignment: { id },
    });

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
    await this.checkpointRecordRepository.softDelete({
      patrolAssignment: { id },
    });

    // Soft delete de la asignación
    await this.patrolAssignmentRepository.softDelete(id);

    return existingAssignment;
  }
}
