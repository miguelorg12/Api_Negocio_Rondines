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
      const currentHour = currentTime.getHours();
      const currentMinutes = currentTime.getMinutes();
      const currentTimeInMinutes = currentHour * 60 + currentMinutes;

      // 6. Obtener horas del shift
      const shiftStartTime = new Date(patrolAssignment.shift.start_time);
      const shiftEndTime = new Date(patrolAssignment.shift.end_time);

      // Convertir a hora local para comparación
      const shiftStartHour = shiftStartTime.getUTCHours();
      const shiftStartMinutes = shiftStartTime.getUTCMinutes();
      const shiftStartInMinutes = shiftStartHour * 60 + shiftStartMinutes;

      const shiftEndHour = shiftEndTime.getUTCHours();
      const shiftEndMinutes = shiftEndTime.getUTCMinutes();
      const shiftEndInMinutes = shiftEndHour * 60 + shiftEndMinutes;

      // Obtener hora actual en UTC para comparación consistente
      const currentTimeUTC = new Date(validationData.timestamp);
      const currentHourUTC = currentTimeUTC.getUTCHours();
      const currentMinutesUTC = currentTimeUTC.getUTCMinutes();
      const currentTimeInMinutesUTC = currentHourUTC * 60 + currentMinutesUTC;

      // 7. Lógica de validación
      if (!existingPatrolRecord) {
        // No hay record, verificar si puede iniciar
        if (currentTimeInMinutesUTC >= shiftStartInMinutes) {
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
          return {
            success: false,
            message: `Aún no es hora de iniciar el turno. Tu turno inicia a las ${shiftStartHour
              .toString()
              .padStart(2, "0")}:${shiftStartMinutes
              .toString()
              .padStart(2, "0")} UTC`,
            shift: patrolAssignment.shift,
          };
        }
      } else {
        // Ya existe un record, verificar estado
        if (existingPatrolRecord.status === "en_progreso") {
          // Está en progreso, verificar si puede terminar
          if (currentTimeInMinutesUTC >= shiftEndInMinutes) {
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
            return {
              success: false,
              message: `Tu turno está en progreso. Termina a las ${shiftEndHour
                .toString()
                .padStart(2, "0")}:${shiftEndMinutes
                .toString()
                .padStart(2, "0")} UTC`,
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
          if (currentTimeInMinutesUTC >= shiftStartInMinutes) {
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
            return {
              success: false,
              message: `Aún no es hora de iniciar el turno. Tu turno inicia a las ${shiftStartHour
                .toString()
                .padStart(2, "0")}:${shiftStartMinutes
                .toString()
                .padStart(2, "0")} UTC`,
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
