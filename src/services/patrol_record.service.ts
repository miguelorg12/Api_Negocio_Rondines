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
   * Obtener el último registro de patrulla en progreso del usuario con información completa
   * @param userId - ID del usuario/guardia
   * @returns Objeto con información completa del patrol record y sus checkpoints
   */
  async getCurrentPatrolRecord(userId: number): Promise<any> {
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
        "patrolAssignment.patrol.routePoints",
        "patrolAssignment.patrol.routePoints.checkpoint",
        "patrolAssignment.shift",
        "patrolAssignment.user",
        "patrolAssignment.patrol.routePoints.checkpoint.branch",
        "patrolAssignment.checkpointRecords",
      ],
      order: {
        created_at: "DESC", // Obtener el más reciente
      },
    });

    if (!patrolRecord) {
      return null;
    }

    // Agregar información de checkpoint records si existen
    const checkpointRecords = await AppDataSource.getRepository(
      CheckpointRecord
    ).find({
      where: {
        patrolAssignment: { id: patrolRecord.patrolAssignment.id },
      },
      relations: ["checkpoint"],
      order: { created_at: "ASC" },
    });

    // Crear un objeto con toda la información completa sin duplicados
    const enhancedPatrolRecord = {
      id: patrolRecord.id,
      date: patrolRecord.date,
      status: patrolRecord.status,
      actual_start: patrolRecord.actual_start,
      actual_end: patrolRecord.actual_end,
      created_at: patrolRecord.created_at,
      updated_at: patrolRecord.updated_at,
      patrolAssignment: {
        id: patrolRecord.patrolAssignment.id,
        date: patrolRecord.patrolAssignment.date,
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
      routePoints: patrolRecord.patrolAssignment.patrol.routePoints.map(
        (routePoint) => {
          const checkpointRecord = checkpointRecords.find(
            (cr) => cr.checkpoint.id === routePoint.checkpoint.id
          );

          return {
            id: routePoint.id,
            order: routePoint.order,
            latitude: routePoint.latitude,
            longitude: routePoint.longitude,
            checkpoint: {
              id: routePoint.checkpoint.id,
              name: routePoint.checkpoint.name,
              nfc_uid: routePoint.checkpoint.nfc_uid,
              status: checkpointRecord?.status || "pending",
              check_time: checkpointRecord?.check_time?.toISOString(),
              real_check: checkpointRecord?.real_check?.toISOString(),
            },
          };
        }
      ),
    };

    return enhancedPatrolRecord;
  }

  /**
   * Obtener todas las asignaciones del usuario para el día de hoy
   * @param userId - ID del usuario/guardia
   * @returns Array de PatrolRecord con todas las asignaciones del día
   */
  async getUserAssignmentsForToday(userId: number): Promise<PatrolRecord[]> {
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59
    );

    return await this.patrolRecordRepository
      .createQueryBuilder("record")
      .leftJoinAndSelect("record.patrolAssignment", "patrolAssignment")
      .leftJoinAndSelect("patrolAssignment.patrol", "patrol")
      .leftJoinAndSelect("patrolAssignment.shift", "shift")
      .leftJoinAndSelect("patrolAssignment.user", "user")
      .leftJoinAndSelect("patrol.plans", "plans")
      .where("user.id = :userId", { userId })
      .andWhere("record.date BETWEEN :startOfDay AND :endOfDay", {
        startOfDay,
        endOfDay,
      })
      .orderBy("shift.start_time", "ASC")
      .getMany();
  }
}
