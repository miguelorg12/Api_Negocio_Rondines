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
    // Validar si el guardia ya tiene una asignación que se solape en horarios
    const assignmentDate =
      patrolAssignmentDto.date instanceof Date
        ? patrolAssignmentDto.date
        : new Date(patrolAssignmentDto.date);

    // Obtener el shift para verificar horarios
    const shift = await this.shiftRepository.findOne({
      where: { id: patrolAssignmentDto.shift_id },
    });

    if (!shift) {
      throw new Error("Turno no encontrado");
    }

    // Buscar asignaciones existentes del usuario para la misma fecha
    const existingAssignments = await this.patrolAssignmentRepository.find({
      where: {
        user: { id: patrolAssignmentDto.user_id },
        date: assignmentDate,
      },
      relations: ["shift"],
    });

    // Verificar si hay solapamiento de horarios
    for (const existingAssignment of existingAssignments) {
      const existingShift = existingAssignment.shift;

      // Convertir horarios a minutos para comparación
      const newStartMinutes = this.timeToMinutes(shift.start_time);
      const newEndMinutes = this.timeToMinutes(shift.end_time);
      const existingStartMinutes = this.timeToMinutes(existingShift.start_time);
      const existingEndMinutes = this.timeToMinutes(existingShift.end_time);

      // Verificar si hay solapamiento
      if (
        this.hasTimeOverlap(
          newStartMinutes,
          newEndMinutes,
          existingStartMinutes,
          existingEndMinutes
        )
      ) {
        const dateString = assignmentDate.toISOString().split("T")[0];
        throw new Error(
          `El guardia ya tiene una asignación para el día ${dateString} que se solapa con el horario del turno "${
            shift.name
          }" (${this.formatTime(shift.start_time)} - ${this.formatTime(
            shift.end_time
          )}). No se puede crear otra asignación con horarios solapados.`
        );
      }
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

  // Método auxiliar para convertir hora a minutos
  private timeToMinutes(date: Date): number {
    return date.getHours() * 60 + date.getMinutes();
  }

  // Método auxiliar para formatear hora
  private formatTime(date: Date): string {
    return date.toTimeString().slice(0, 5);
  }

  // Método auxiliar para verificar solapamiento de horarios
  private hasTimeOverlap(
    start1: number,
    end1: number,
    start2: number,
    end2: number
  ): boolean {
    // Manejar turnos nocturnos que cruzan la medianoche
    if (end1 < start1) {
      // El primer turno cruza la medianoche
      return !(end2 < start1 && start2 > end1);
    } else if (end2 < start2) {
      // El segundo turno cruza la medianoche
      return !(end1 < start2 && start1 > end2);
    } else {
      // Ambos turnos en el mismo día
      return !(end1 <= start2 || end2 <= start1);
    }
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

    // Si se va a actualizar el shift_id, verificar que no haya solapamiento
    if (
      updateData.shift_id &&
      updateData.shift_id !== existingAssignment.shift.id
    ) {
      const newShift = await this.shiftRepository.findOne({
        where: { id: updateData.shift_id },
      });

      if (!newShift) {
        throw new Error("Turno no encontrado");
      }

      // Buscar otras asignaciones del usuario para la misma fecha (excluyendo la actual)
      const otherAssignments = await this.patrolAssignmentRepository.find({
        where: {
          user: { id: existingAssignment.user.id },
          date: updateData.date || existingAssignment.date,
        },
        relations: ["shift"],
      });

      // Verificar si hay solapamiento con el nuevo turno
      for (const otherAssignment of otherAssignments) {
        if (otherAssignment.id === id) continue; // Excluir la asignación actual

        const otherShift = otherAssignment.shift;

        // Convertir horarios a minutos para comparación
        const newStartMinutes = this.timeToMinutes(newShift.start_time);
        const newEndMinutes = this.timeToMinutes(newShift.end_time);
        const otherStartMinutes = this.timeToMinutes(otherShift.start_time);
        const otherEndMinutes = this.timeToMinutes(otherShift.end_time);

        // Verificar si hay solapamiento
        if (
          this.hasTimeOverlap(
            newStartMinutes,
            newEndMinutes,
            otherStartMinutes,
            otherEndMinutes
          )
        ) {
          const dateString = (updateData.date || existingAssignment.date)
            .toISOString()
            .split("T")[0];
          throw new Error(
            `No se puede actualizar el turno porque se solaparía con otra asignación del día ${dateString} para el turno "${
              otherShift.name
            }" (${this.formatTime(otherShift.start_time)} - ${this.formatTime(
              otherShift.end_time
            )}).`
          );
        }
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

  async getByBranchId(branchId: number): Promise<PatrolAssignment[]> {
    return await this.patrolAssignmentRepository.find({
      where: { user: { branch: { id: branchId } } },
      relations: ["user", "patrol", "shift"],
      order: { date: "ASC" },
    });
  }

  async getByUserIdAndDate(
    userId: number,
    date: Date
  ): Promise<PatrolAssignment[]> {
    const targetDate = date instanceof Date ? date : new Date(date);

    return await this.patrolAssignmentRepository.find({
      where: {
        user: { id: userId },
        date: targetDate,
      },
      relations: ["user", "patrol", "shift"],
      order: {
        shift: { start_time: "ASC" },
      },
    });
  }
}
