import { AppDataSource } from "@configs/data-source";
import { PatrolRecord } from "@interfaces/entity/patrol_record.entity";
import { CheckpointRecord } from "@interfaces/entity/checkpoint_record.entity";
import {
  PatrolRecordDto,
  PartialPatrolRecordDto,
} from "@interfaces/dto/patrol_record.dto";
import { Between } from "typeorm";

export class PatrolRecordService {
  private patrolRecordRepository = AppDataSource.getRepository(PatrolRecord);
  private checkpointRecordRepository = AppDataSource.getRepository(CheckpointRecord);

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
   * Obtener el último registro de patrulla en progreso del usuario
   * @param userId - ID del usuario/guardia
   * @returns PatrolRecord con estado "en_progreso" más reciente
   */
  async getCurrentPatrolRecord(userId: number): Promise<PatrolRecord | null> {
    return await this.patrolRecordRepository.findOne({
      where: {
        status: "en_progreso",
        patrolAssignment: {
          user: { id: userId },
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
      order: {
        created_at: "DESC", // Obtener el más reciente
      },
    });
  }

  /**
   * Obtener el patrol record actual del usuario con todos los checkpoint records
   * @param userId - ID del usuario/guardia
   * @returns PatrolRecord con checkpoint records completos
   */
  async getCurrentPatrolRecordWithCheckpoints(userId: number): Promise<any> {
    // Obtener el patrol record actual
    const patrolRecord = await this.patrolRecordRepository.findOne({
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
        "patrolAssignment.user",
      ],
      order: {
        created_at: "DESC",
      },
    });

    if (!patrolRecord) {
      return null;
    }

    // Obtener todos los checkpoint records de esta asignación
    const checkpointRecords = await this.checkpointRecordRepository.find({
      where: {
        patrolAssignment: { id: patrolRecord.patrolAssignment.id },
      },
      relations: [
        "patrolAssignment",
        "patrolAssignment.user",
        "patrolAssignment.patrol",
        "patrolAssignment.shift",
        "checkpoint",
        "patrolAssignment.patrol.routePoints",
        "patrolAssignment.patrol.routePoints.checkpoint",
      ],
      order: {
        created_at: "ASC",
      },
    });

    // Formatear los checkpoint records con coordenadas
    const formattedCheckpointRecords = checkpointRecords.map(record => {
      const routePoint = record.patrolAssignment.patrol.routePoints?.find(
        (rp) => rp.checkpoint.id === record.checkpoint.id
      );

      return {
        id: record.id,
        check_time: record.check_time.toISOString(),
        real_check: record.real_check?.toISOString(),
        checkpoint: {
          id: record.checkpoint.id,
          name: record.checkpoint.name,
          nfc_uid: record.checkpoint.nfc_uid,
          latitude: routePoint?.latitude || null,
          longitude: routePoint?.longitude || null,
          status: record.status,
        },
        created_at: record.created_at.toISOString(),
        updated_at: record.updated_at.toISOString(),
      };
    });

    // Retornar el patrol record con los checkpoint records formateados
    return {
      id: patrolRecord.id,
      date: patrolRecord.date.toISOString(),
      status: patrolRecord.status,
      actual_start: patrolRecord.actual_start?.toISOString(),
      actual_end: patrolRecord.actual_end?.toISOString(),
      patrol_assignment: {
        id: patrolRecord.patrolAssignment.id,
        date: patrolRecord.patrolAssignment.date.toISOString(),
        user: {
          id: patrolRecord.patrolAssignment.user.id,
          name: patrolRecord.patrolAssignment.user.name,
          last_name: patrolRecord.patrolAssignment.user.last_name,
        },
        patrol: {
          id: patrolRecord.patrolAssignment.patrol.id,
          name: patrolRecord.patrolAssignment.patrol.name,
        },
        shift: {
          id: patrolRecord.patrolAssignment.shift.id,
          name: patrolRecord.patrolAssignment.shift.name,
        },
      },
      checkpoint_records: formattedCheckpointRecords,
      created_at: patrolRecord.created_at.toISOString(),
      updated_at: patrolRecord.updated_at.toISOString(),
    };
  }
}
