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
    return `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;
  }

  // Función auxiliar para convertir hora a minutos para comparación
  private timeToMinutes(hour: number, minute: number): number {
    return hour * 60 + minute;
  }

  // Función para crear una fecha base con la hora del turno
  // Ahora que usamos columnas 'time', necesitamos crear fechas base para comparaciones
  private createBaseDateWithTime(timeValue: Date, baseDate: Date): Date {
    // timeValue ahora es solo la hora (de columna 'time')
    // Creamos una fecha completa usando la fecha base y la hora del turno
    const hours = timeValue.getHours();
    const minutes = timeValue.getMinutes();

    return new Date(
      baseDate.getFullYear(),
      baseDate.getMonth(),
      baseDate.getDate(),
      hours,
      minutes,
      0,
      0
    );
  }

  // Función para verificar si un turno cruza la medianoche
  private isOvernightShift(startTime: Date, endTime: Date): boolean {
    const startHour = startTime.getHours();
    const endHour = endTime.getHours();

    // Si la hora de inicio es mayor que la hora de fin, cruza la medianoche
    return startHour > endHour;
  }

  // Función para obtener la hora actual en minutos considerando turnos nocturnos
  private getCurrentTimeInMinutes(
    currentTime: Date,
    shiftStartTime: Date,
    shiftEndTime: Date
  ): number {
    const currentHour = currentTime.getHours();
    const currentMinutes = currentTime.getMinutes();
    const currentTimeInMinutes = this.timeToMinutes(
      currentHour,
      currentMinutes
    );

    const isOvernight = this.isOvernightShift(shiftStartTime, shiftEndTime);

    if (isOvernight) {
      // Para turnos nocturnos, si la hora actual es menor que la hora de inicio,
      // significa que estamos en el día siguiente
      const shiftStartHour = shiftStartTime.getHours();
      if (currentHour < shiftStartHour) {
        // Estamos en el día siguiente, sumar 24 horas
        return currentTimeInMinutes + 24 * 60;
      }
    }

    return currentTimeInMinutes;
  }

  // Función para obtener la hora de fin del turno en minutos considerando turnos nocturnos
  private getShiftEndTimeInMinutes(
    shiftEndTime: Date,
    shiftStartTime: Date
  ): number {
    const shiftEndHour = shiftEndTime.getHours();
    const shiftEndMinutes = shiftEndTime.getMinutes();
    const shiftEndInMinutes = this.timeToMinutes(shiftEndHour, shiftEndMinutes);

    const isOvernight = this.isOvernightShift(shiftStartTime, shiftEndTime);

    if (isOvernight) {
      // Para turnos nocturnos, la hora de fin está en el día siguiente
      return shiftEndInMinutes + 24 * 60;
    }

    return shiftEndInMinutes;
  }

  // Método auxiliar para obtener todas las asignaciones de un usuario en una fecha
  private async getUserAssignmentsForDate(
    userId: number,
    date: Date
  ): Promise<PatrolAssignment[]> {
    return await this.patrolAssignmentRepository
      .createQueryBuilder("assignment")
      .leftJoinAndSelect("assignment.patrol", "patrol")
      .leftJoinAndSelect("assignment.shift", "shift")
      .where("assignment.user.id = :userId", { userId })
      .andWhere("DATE(assignment.date) = DATE(:date)", { date })
      .orderBy("shift.start_time", "ASC")
      .getMany();
  }

  // Método auxiliar para determinar qué assignment está activo según la hora actual
  private getActiveAssignment(
    assignments: PatrolAssignment[],
    currentTime: Date
  ): PatrolAssignment | null {
    const currentHour = currentTime.getHours();
    const currentMinutes = currentTime.getMinutes();
    const currentTimeInMinutes = this.timeToMinutes(
      currentHour,
      currentMinutes
    );

    for (const assignment of assignments) {
      // Ahora que usamos columnas 'time', necesitamos crear fechas base
      const baseDate = new Date(); // Usar fecha actual como base
      const shiftStartTime = this.createBaseDateWithTime(
        assignment.shift.start_time,
        baseDate
      );
      const shiftEndTime = this.createBaseDateWithTime(
        assignment.shift.end_time,
        baseDate
      );

      const shiftStartInMinutes = this.timeToMinutes(
        shiftStartTime.getHours(),
        shiftStartTime.getMinutes()
      );
      const shiftEndInMinutes = this.getShiftEndTimeInMinutes(
        shiftEndTime,
        shiftStartTime
      );

      // Verificar si la hora actual está dentro del rango del turno
      if (
        currentTimeInMinutes >= shiftStartInMinutes &&
        currentTimeInMinutes < shiftEndInMinutes
      ) {
        return assignment;
      }
    }

    return null;
  }

  // Método auxiliar para obtener el siguiente assignment
  private getNextAssignment(
    assignments: PatrolAssignment[],
    currentAssignment: PatrolAssignment
  ): PatrolAssignment | null {
    const currentIndex = assignments.findIndex(
      (assignment) => assignment.id === currentAssignment.id
    );
    if (currentIndex < assignments.length - 1) {
      return assignments[currentIndex + 1];
    }
    return null;
  }

  // Método auxiliar para obtener el próximo assignment que se puede iniciar
  private getNextUpcomingAssignment(
    assignments: PatrolAssignment[],
    currentTime: Date
  ): PatrolAssignment | null {
    const currentHour = currentTime.getHours();
    const currentMinutes = currentTime.getMinutes();
    const currentTimeInMinutes = this.timeToMinutes(
      currentHour,
      currentMinutes
    );

    for (const assignment of assignments) {
      // Crear fecha base para la comparación
      const baseDate = new Date();
      const shiftStartTime = this.createBaseDateWithTime(
        assignment.shift.start_time,
        baseDate
      );
      const shiftStartInMinutes = this.timeToMinutes(
        shiftStartTime.getHours(),
        shiftStartTime.getMinutes()
      );

      // Si la hora de inicio es mayor que la hora actual, es el próximo
      if (shiftStartInMinutes > currentTimeInMinutes) {
        return assignment;
      }
    }

    return null;
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

      // 3. Buscar TODAS las asignaciones del usuario para la fecha actual
      const userAssignments = await this.getUserAssignmentsForDate(
        user.id,
        today
      );

      if (userAssignments.length === 0) {
        return {
          success: false,
          message: "No tienes asignado ningún turno para hoy",
        };
      }

      // 4. Obtener hora actual del timestamp
      const currentTime = new Date(validationData.timestamp);

      // 5. Determinar qué assignment está activo según la hora actual
      const activeAssignment = this.getActiveAssignment(
        userAssignments,
        currentTime
      );

      if (!activeAssignment) {
        // No hay turno activo en este momento, verificar si puede iniciar el próximo
        const nextUpcomingAssignment = this.getNextUpcomingAssignment(
          userAssignments,
          currentTime
        );

        if (nextUpcomingAssignment) {
          // Crear fecha base para formatear la hora
          const baseDate = new Date();
          const shiftStartTime = this.createBaseDateWithTime(
            nextUpcomingAssignment.shift.start_time,
            baseDate
          );
          const startTimeFormatted = this.formatTimeTimestamp(
            shiftStartTime.getHours(),
            shiftStartTime.getMinutes()
          );

          return {
            success: false,
            message: `Aún no es hora de iniciar el turno. Tu próximo turno inicia a las ${startTimeFormatted}`,
            shift: nextUpcomingAssignment.shift,
          };
        } else {
          return {
            success: false,
            message: "No tienes turnos programados para este momento del día",
          };
        }
      }

      // 6. Buscar el patrol record del assignment activo
      const activePatrolRecord = await this.patrolRecordRepository.findOne({
        where: { patrolAssignment: { id: activeAssignment.id } },
      });

      // 7. Obtener horarios del turno activo
      // Crear fechas base para las comparaciones
      const baseDate = new Date();
      const shiftStartTime = this.createBaseDateWithTime(
        activeAssignment.shift.start_time,
        baseDate
      );
      const shiftEndTime = this.createBaseDateWithTime(
        activeAssignment.shift.end_time,
        baseDate
      );

      const shiftStartInMinutes = this.timeToMinutes(
        shiftStartTime.getHours(),
        shiftStartTime.getMinutes()
      );
      const shiftEndInMinutes = this.getShiftEndTimeInMinutes(
        shiftEndTime,
        shiftStartTime
      );
      const currentTimeInMinutes = this.getCurrentTimeInMinutes(
        currentTime,
        shiftStartTime,
        shiftEndTime
      );

      // 8. Lógica de validación del turno activo
      if (!activePatrolRecord) {
        // No hay record, verificar si puede iniciar
        if (currentTimeInMinutes >= shiftStartInMinutes) {
          // Crear nuevo patrol record
          const newPatrolRecord = this.patrolRecordRepository.create({
            date: today,
            actual_start: currentTime,
            status: "en_progreso",
            patrolAssignment: activeAssignment,
          });

          await this.patrolRecordRepository.save(newPatrolRecord);

          return {
            success: true,
            message: "Turno iniciado correctamente",
            status: "en_progreso",
            patrolRecord: newPatrolRecord,
            shift: activeAssignment.shift,
          };
        } else {
          const startTimeFormatted = this.formatTimeTimestamp(
            shiftStartTime.getHours(),
            shiftStartTime.getMinutes()
          );
          return {
            success: false,
            message: `Aún no es hora de iniciar el turno. Tu turno inicia a las ${startTimeFormatted}`,
            shift: activeAssignment.shift,
          };
        }
      } else {
        // Ya existe un record, verificar estado
        if (activePatrolRecord.status === "en_progreso") {
          // Está en progreso, verificar si puede terminar
          if (currentTimeInMinutes >= shiftEndInMinutes) {
            // Completar el turno actual
            activePatrolRecord.actual_end = currentTime;
            activePatrolRecord.status = "completado";
            await this.patrolRecordRepository.save(activePatrolRecord);

            // Buscar el siguiente assignment
            const nextAssignment = this.getNextAssignment(
              userAssignments,
              activeAssignment
            );

            if (nextAssignment) {
              // Crear record para el siguiente assignment y marcarlo como en progreso
              const nextPatrolRecord = this.patrolRecordRepository.create({
                date: today,
                actual_start: currentTime,
                status: "en_progreso",
                patrolAssignment: nextAssignment,
              });

              await this.patrolRecordRepository.save(nextPatrolRecord);

              return {
                success: true,
                message: `Turno "${activeAssignment.shift.name}" completado. Iniciando turno "${nextAssignment.shift.name}"`,
                status: "en_progreso",
                patrolRecord: nextPatrolRecord,
                shift: nextAssignment.shift,
              };
            } else {
              // No hay siguiente assignment, terminar jornada
              return {
                success: true,
                message: "Turno completado. Has terminado tu jornada del día",
                status: "completado",
                patrolRecord: activePatrolRecord,
                shift: activeAssignment.shift,
              };
            }
          } else {
            const endTimeFormatted = this.formatTimeTimestamp(
              shiftEndTime.getHours(),
              shiftEndTime.getMinutes()
            );
            const currentTimeFormatted = this.formatTimeTimestamp(
              currentTime.getHours(),
              currentTime.getMinutes()
            );
            return {
              success: false,
              message: `Tu turno está en progreso. Termina a las ${endTimeFormatted}. Hora actual: ${currentTimeFormatted}`,
              status: "en_progreso",
              patrolRecord: activePatrolRecord,
              shift: activeAssignment.shift,
            };
          }
        } else if (activePatrolRecord.status === "completado") {
          return {
            success: false,
            message: "Ya completaste este turno",
            status: "completado",
            patrolRecord: activePatrolRecord,
            shift: activeAssignment.shift,
          };
        } else if (activePatrolRecord.status === "pendiente") {
          // Record pendiente, verificar si puede iniciar
          if (currentTimeInMinutes >= shiftStartInMinutes) {
            // Actualizar record para iniciar
            activePatrolRecord.actual_start = currentTime;
            activePatrolRecord.status = "en_progreso";

            await this.patrolRecordRepository.save(activePatrolRecord);

            return {
              success: true,
              message: "Turno iniciado correctamente",
              status: "en_progreso",
              patrolRecord: activePatrolRecord,
              shift: activeAssignment.shift,
            };
          } else {
            const startTimeFormatted = this.formatTimeTimestamp(
              shiftStartTime.getHours(),
              shiftStartTime.getMinutes()
            );
            return {
              success: false,
              message: `Aún no es hora de iniciar el turno. Tu turno inicia a las ${startTimeFormatted}`,
              status: "pendiente",
              patrolRecord: activePatrolRecord,
              shift: activeAssignment.shift,
            };
          }
        } else {
          return {
            success: false,
            message: `Tu turno tiene estado: ${activePatrolRecord.status}`,
            status: activePatrolRecord.status,
            patrolRecord: activePatrolRecord,
            shift: activeAssignment.shift,
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
