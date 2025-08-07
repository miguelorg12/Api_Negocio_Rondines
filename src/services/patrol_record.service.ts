import { AppDataSource } from "@configs/data-source";
import { PatrolRecord } from "@interfaces/entity/patrol_record.entity";
import {
  PatrolRecordDto,
  PartialPatrolRecordDto,
} from "@interfaces/dto/patrol_record.dto";
import { Between } from "typeorm";

export class PatrolRecordService {
  private patrolRecordRepository = AppDataSource.getRepository(PatrolRecord);

  async getAll(): Promise<PatrolRecord[]> {
    return await this.patrolRecordRepository.find();
  }

  async create(dto: PatrolRecordDto): Promise<PatrolRecord> {
    console.log("PatrolRecordService.create - DTO recibido:", dto);

    // Crear el objeto de datos para el insert
    const insertData: any = {
      date: dto.date,
      actual_start: dto.actual_start,
      actual_end: dto.actual_end,
      status: dto.status || "pendiente",
    };

    // Si se proporciona patrol_assignment_id, agregarlo directamente
    if (dto.patrol_assignment_id) {
      insertData.patrolAssignment = { id: dto.patrol_assignment_id };
      console.log("Agregando patrol_assignment_id:", dto.patrol_assignment_id);
    }

    console.log("Datos a insertar:", insertData);

    // Usar insert para crear el registro
    const result = await this.patrolRecordRepository.insert({
      date: dto.date,
      actual_start: dto.actual_start,
      actual_end: dto.actual_end,
      status: dto.status || "pendiente",
      patrolAssignment: { id: dto.patrol_assignment_id },
    });
    console.log("Resultado del insert:", result);

    // Obtener el registro creado con las relaciones
    const createdPatrolRecord = await this.patrolRecordRepository.findOne({
      where: { id: result.identifiers[0].id },
      relations: ["patrolAssignment"],
    });

    console.log("PatrolRecord creado con relaciones:", createdPatrolRecord);

    if (!createdPatrolRecord) {
      throw new Error("Error al crear el registro de patrulla");
    }

    return createdPatrolRecord;
  }

  async findById(id: number): Promise<PatrolRecord | null> {
    return await this.patrolRecordRepository.findOne({
      where: { id },
    });
  }

  async update(
    id: number,
    dto: PartialPatrolRecordDto
  ): Promise<PatrolRecord | null> {
    const patrolRecord = await this.findById(id);
    if (!patrolRecord) {
      throw new Error("Registro de patrulla no encontrado");
    }
    await this.patrolRecordRepository.update(id, dto);
    return this.findById(id);
  }

  async delete(id: number): Promise<PatrolRecord | null> {
    const patrolRecord = await this.findById(id);
    if (!patrolRecord) {
      throw new Error("Registro de patrulla no encontrado");
    }
    await this.patrolRecordRepository.update(id, {
      status: "cancelado",
    });
    return this.findById(id);
  }

  async findByAssigmentId(id: number): Promise<PatrolRecord | null> {
    return await this.patrolRecordRepository.findOne({
      where: { patrolAssignment: { id } },
      relations: ["patrolAssignment"],
    });
  }

  /**
   * Obtener patrol records completados por user_id
   * @param userId - ID del usuario/guardia
   * @returns Array de PatrolRecord con estado "completado"
   */
  async getCompletedPatrolRecords(userId: number): Promise<PatrolRecord[]> {
    return await this.patrolRecordRepository.find({
      where: {
        status: "completado",
        patrolAssignment: {
          user: { id: userId },
        },
      },
      relations: [
        "patrolAssignment",
        "patrolAssignment.patrol",
        "patrolAssignment.shift",
        "patrolAssignment.patrol.routePoints",
        "patrolAssignment.patrol.routePoints.checkpoint",
      ],
      order: {
        date: "DESC",
      },
    });
  }

  /**
   * Obtener patrol records pendientes por user_id
   * @param userId - ID del usuario/guardia
   * @returns Array de PatrolRecord con estado "pendiente"
   */
  async getPendingPatrolRecords(userId: number): Promise<PatrolRecord[]> {
    return await this.patrolRecordRepository.find({
      where: {
        status: "pendiente",
        patrolAssignment: {
          user: { id: userId },
        },
      },
      relations: [
        "patrolAssignment",
        "patrolAssignment.patrol",
        "patrolAssignment.shift",
        "patrolAssignment.patrol.routePoints",
        "patrolAssignment.patrol.routePoints.checkpoint",
      ],
      order: {
        date: "ASC",
      },
    });
  }

  /**
   * Obtener patrol records en progreso por user_id
   * @param userId - ID del usuario/guardia
   * @returns Array de PatrolRecord con estado "en_progreso"
   */
  async getInProgressPatrolRecords(userId: number): Promise<PatrolRecord[]> {
    return await this.patrolRecordRepository.find({
      where: {
        status: "en_progreso",
        patrolAssignment: {
          user: { id: userId },
        },
      },
      relations: [
        "patrolAssignment",
        "patrolAssignment.patrol",
        "patrolAssignment.shift",
        "patrolAssignment.patrol.routePoints",
        "patrolAssignment.patrol.routePoints.checkpoint",
      ],
      order: {
        date: "DESC",
      },
    });
  }

  /**
   * Obtener la ronda actual del usuario del día de hoy que esté en progreso
   * @param userId - ID del usuario/guardia
   * @returns PatrolRecord con estado "en_progreso" del día de hoy
   */
  async getCurrentPatrolRecord(userId: number): Promise<PatrolRecord | null> {
    // Obtener la fecha actual sin hora para comparar solo la fecha
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await this.patrolRecordRepository.findOne({
      where: {
        status: "en_progreso",
        patrolAssignment: {
          user: { id: userId },
          date: Between(today, tomorrow), // Buscar asignaciones del día de hoy usando rango
        },
      },
      relations: [
        "patrolAssignment",
        "patrolAssignment.patrol",
        "patrolAssignment.patrol.routePoints",
        "patrolAssignment.patrol.routePoints.checkpoint",
        "patrolAssignment.shift",
        "patrolAssignment.user",
      ],
    });
  }
}
