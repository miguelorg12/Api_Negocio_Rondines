import { AppDataSource } from "@configs/data-source";
import { User } from "@entities/user.entity";
import { PatrolAssignment } from "@interfaces/entity/patrol_assigment.entity";
import { PatrolRecord } from "@interfaces/entity/patrol_record.entity";
import { Shift } from "@interfaces/entity/shift.entity";
import { Repository } from "typeorm";
import {
  ShiftValidationDto,
  ShiftValidationResponse,
} from "@dto/shift_validation.dto";

export class ShiftValidationService {
  private userRepository: Repository<User>;
  private patrolAssignmentRepository: Repository<PatrolAssignment>;
  private patrolRecordRepository: Repository<PatrolRecord>;
  private shiftRepository: Repository<Shift>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.patrolAssignmentRepository =
      AppDataSource.getRepository(PatrolAssignment);
    this.patrolRecordRepository = AppDataSource.getRepository(PatrolRecord);
    this.shiftRepository = AppDataSource.getRepository(Shift);
  }

  // Función auxiliar para formatear hora en formato timestamp (24 horas)
  private formatTimeTimestamp(hour: number, minute: number): string {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  }

  // Función auxiliar para convertir hora a minutos para comparación
  private timeToMinutes(hour: number, minute: number): number {
    return hour * 60 + minute;
  }

  // Función para verificar si un turno cruza la medianoche
  private isOvernightShift(startTime: Date, endTime: Date): boolean {
    const startHour = startTime.getHours();
    const endHour = endTime.getHours();
    
    // Si la hora de inicio es mayor que la hora de fin, cruza la medianoche
    return startHour > endHour;
  }

  // Función para obtener la hora actual en minutos considerando turnos nocturnos
  private getCurrentTimeInMinutes(currentTime: Date, shiftStartTime: Date, shiftEndTime: Date): number {
    const currentHour = currentTime.getHours();
    const currentMinutes = currentTime.getMinutes();
    const currentTimeInMinutes = this.timeToMinutes(currentHour, currentMinutes);
    
    const isOvernight = this.isOvernightShift(shiftStartTime, shiftEndTime);
    
    if (isOvernight) {
      // Para turnos nocturnos, si la hora actual es menor que la hora de inicio,
      // significa que estamos en el día siguiente
      const shiftStartHour = shiftStartTime.getHours();
      if (currentHour < shiftStartHour) {
        // Estamos en el día siguiente, sumar 24 horas
        return currentTimeInMinutes + (24 * 60);
      }
    }
    
    return currentTimeInMinutes;
  }

  // Función para obtener la hora de fin del turno en minutos considerando turnos nocturnos
  private getShiftEndTimeInMinutes(shiftEndTime: Date, shiftStartTime: Date): number {
    const shiftEndHour = shiftEndTime.getHours();
    const shiftEndMinutes = shiftEndTime.getMinutes();
    const shiftEndInMinutes = this.timeToMinutes(shiftEndHour, shiftEndMinutes);
    
    const isOvernight = this.isOvernightShift(shiftStartTime, shiftEndTime);
    
    if (isOvernight) {
      // Para turnos nocturnos, la hora de fin está en el día siguiente
      return shiftEndInMinutes + (24 * 60);
    }
    
    return shiftEndInMinutes;
  }

  async validateShift(
    validationData: ShiftValidationDto
  ): Promise<ShiftValidationResponse> {
    try {
      // 1. Buscar usuario por biometric
      const user = await this.userRepository.findOne({
        where: { biometric: validationData.biometric },
        relations: ["role"],
      });

      if (!user) {
        return {
          success: false,
          message: "Usuario no encontrado con el ID biométrico proporcionado",
        };
      }

      // 2. Obtener la fecha actual (solo fecha, sin hora)
      const currentDate = new Date(validationData.timestamp);
      const today = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate()
      );

      // 3. Buscar patrol assignment para el usuario y fecha actual
      const patrolAssignment = await this.patrolAssignmentRepository
        .createQueryBuilder("assignment")
        .leftJoinAndSelect("assignment.patrol", "patrol")
        .leftJoinAndSelect("assignment.shift", "shift")
        .where("assignment.user.id = :userId", { userId: user.id })
        .andWhere("DATE(assignment.date) = DATE(:today)", { today })
        .getOne();

      if (!patrolAssignment) {
        return {
          success: false,
          message: "No tienes asignado un turno para hoy",
        };
      }

      // 4. Buscar patrol record existente
      const existingPatrolRecord = await this.patrolRecordRepository
        .createQueryBuilder("record")
        .where("record.patrolAssignment.id = :assignmentId", {
          assignmentId: patrolAssignment.id,
        })
        .andWhere("DATE(record.date) = DATE(:today)", { today })
        .getOne();

      // 5. Obtener hora actual del timestamp
      const currentTime = new Date(validationData.timestamp);
      
      // 6. Obtener horas del shift
      const shiftStartTime = new Date(patrolAssignment.shift.start_time);
      const shiftEndTime = new Date(patrolAssignment.shift.end_time);

      // Convertir a hora local para comparación
      const shiftStartHour = shiftStartTime.getHours();
      const shiftStartMinutes = shiftStartTime.getMinutes();
      const shiftStartInMinutes = this.timeToMinutes(shiftStartHour, shiftStartMinutes);

      // Obtener hora actual y de fin considerando turnos nocturnos
      const currentTimeInMinutes = this.getCurrentTimeInMinutes(currentTime, shiftStartTime, shiftEndTime);
      const shiftEndInMinutes = this.getShiftEndTimeInMinutes(shiftEndTime, shiftStartTime);

      // 7. Lógica de validación
      if (!existingPatrolRecord) {
        // No hay record, verificar si puede iniciar
        if (currentTimeInMinutes >= shiftStartInMinutes) {
          // Crear nuevo patrol record
          const newPatrolRecord = this.patrolRecordRepository.create({
            date: today,
            actual_start: currentTime,
            status: "en_progreso",
            patrolAssignment: patrolAssignment,
          });

          await this.patrolRecordRepository.save(newPatrolRecord);

          return {
            success: true,
            message: "Turno iniciado correctamente",
            status: "en_progreso",
            patrolRecord: newPatrolRecord,
            shift: patrolAssignment.shift,
          };
        } else {
          const startTimeFormatted = this.formatTimeTimestamp(shiftStartHour, shiftStartMinutes);
          return {
            success: false,
            message: `Aún no es hora de iniciar el turno. Tu turno inicia a las ${startTimeFormatted}`,
            shift: patrolAssignment.shift,
          };
        }
      } else {
        // Ya existe un record, verificar estado
        if (existingPatrolRecord.status === "en_progreso") {
          // Está en progreso, verificar si puede terminar
          if (currentTimeInMinutes >= shiftEndInMinutes) {
            // Actualizar record para finalizar
            existingPatrolRecord.actual_end = currentTime;
            existingPatrolRecord.status = "completado";

            await this.patrolRecordRepository.save(existingPatrolRecord);

            return {
              success: true,
              message: "Turno finalizado correctamente",
              status: "completado",
              patrolRecord: existingPatrolRecord,
              shift: patrolAssignment.shift,
            };
          } else {
            const endTimeFormatted = this.formatTimeTimestamp(shiftEndTime.getHours(), shiftEndTime.getMinutes());
            const currentTimeFormatted = this.formatTimeTimestamp(currentTime.getHours(), currentTime.getMinutes());
            return {
              success: false,
              message: `Tu turno está en progreso. Termina a las ${endTimeFormatted}. Hora actual: ${currentTimeFormatted}`,
              status: "en_progreso",
              patrolRecord: existingPatrolRecord,
              shift: patrolAssignment.shift,
            };
          }
        } else if (existingPatrolRecord.status === "completado") {
          return {
            success: false,
            message: "Ya completaste tu turno para hoy",
            status: "completado",
            patrolRecord: existingPatrolRecord,
            shift: patrolAssignment.shift,
          };
        } else if (existingPatrolRecord.status === "pendiente") {
          // Record pendiente, verificar si puede iniciar
          if (currentTimeInMinutes >= shiftStartInMinutes) {
            // Actualizar record para iniciar
            existingPatrolRecord.actual_start = currentTime;
            existingPatrolRecord.status = "en_progreso";

            await this.patrolRecordRepository.save(existingPatrolRecord);

            return {
              success: true,
              message: "Turno iniciado correctamente",
              status: "en_progreso",
              patrolRecord: existingPatrolRecord,
              shift: patrolAssignment.shift,
            };
          } else {
            const startTimeFormatted = this.formatTimeTimestamp(shiftStartHour, shiftStartMinutes);
            return {
              success: false,
              message: `Aún no es hora de iniciar el turno. Tu turno inicia a las ${startTimeFormatted}`,
              status: "pendiente",
              patrolRecord: existingPatrolRecord,
              shift: patrolAssignment.shift,
            };
          }
        } else {
          return {
            success: false,
            message: `Tu turno tiene estado: ${existingPatrolRecord.status}`,
            status: existingPatrolRecord.status,
            patrolRecord: existingPatrolRecord,
            shift: patrolAssignment.shift,
          };
        }
      }
    } catch (error) {
      console.error("Error en validación de turno:", error);
      return {
        success: false,
        message: "Error interno del servidor",
      };
    }
  }
}
