import { Repository } from "typeorm";
import { AppDataSource } from "@configs/data-source";
import { CheckpointRecord } from "@entities/checkpoint_record.entity";
import { PatrolAssignment } from "@entities/patrol_assigment.entity";
import { Checkpoint } from "@entities/checkpoint.entity";
import {
  CheckpointRecordResponse,
  CheckpointRecordCreateRequest,
  CheckpointRecordUpdateRequest,
  CheckpointRecordFilterRequest,
} from "@dto/checkpoint_record.dto";

export class CheckpointRecordService {
  private checkpointRecordRepository: Repository<CheckpointRecord>;
  private patrolAssignmentRepository: Repository<PatrolAssignment>;
  private checkpointRepository: Repository<Checkpoint>;

  constructor() {
    this.checkpointRecordRepository =
      AppDataSource.getRepository(CheckpointRecord);
    this.patrolAssignmentRepository =
      AppDataSource.getRepository(PatrolAssignment);
    this.checkpointRepository = AppDataSource.getRepository(Checkpoint);
  }

  async create(
    data: CheckpointRecordCreateRequest
  ): Promise<CheckpointRecordResponse> {
    // Verificar que la patrol assignment existe
    const patrolAssignment = await this.patrolAssignmentRepository.findOne({
      where: { id: data.patrol_assignment_id },
      relations: ["user", "patrol", "shift"],
    });

    if (!patrolAssignment) {
      throw new Error("La asignación de patrulla no existe");
    }

    // Verificar que el checkpoint existe
    const checkpoint = await this.checkpointRepository.findOne({
      where: { id: data.checkpoint_id },
    });

    if (!checkpoint) {
      throw new Error("El checkpoint no existe");
    }

    // Verificar que no existe ya un registro para esta combinación
    const existingRecord = await this.checkpointRecordRepository.findOne({
      where: {
        patrolAssignment: { id: data.patrol_assignment_id },
        checkpoint: { id: data.checkpoint_id },
      },
    });

    if (existingRecord) {
      throw new Error(
        "Ya existe un registro para esta asignación y checkpoint"
      );
    }

    const checkpointRecord = this.checkpointRecordRepository.create({
      patrolAssignment,
      checkpoint,
      check_time: new Date(data.check_time),
      status: "pending",
    });

    const savedRecord = await this.checkpointRecordRepository.save(
      checkpointRecord
    );

    return this.formatResponse(savedRecord);
  }

  async update(
    id: number,
    data: CheckpointRecordUpdateRequest
  ): Promise<CheckpointRecordResponse> {
    const checkpointRecord = await this.checkpointRecordRepository.findOne({
      where: { id },
      relations: [
        "patrolAssignment",
        "patrolAssignment.user",
        "patrolAssignment.patrol",
        "patrolAssignment.patrol.routePoints",
        "patrolAssignment.patrol.routePoints.checkpoint",
        "patrolAssignment.shift",
        "checkpoint",
      ],
    });

    if (!checkpointRecord) {
      throw new Error("El registro de checkpoint no existe");
    }

    if (data.status) {
      checkpointRecord.status = data.status;
    }

    if (data.real_check) {
      checkpointRecord.real_check = new Date(data.real_check);
    }

    const updatedRecord = await this.checkpointRecordRepository.save(
      checkpointRecord
    );

    return this.formatResponse(updatedRecord);
  }

  async findById(id: number): Promise<CheckpointRecordResponse> {
    const checkpointRecord = await this.checkpointRecordRepository.findOne({
      where: { id },
      relations: [
        "patrolAssignment",
        "patrolAssignment.user",
        "patrolAssignment.patrol",
        "patrolAssignment.patrol.routePoints",
        "patrolAssignment.patrol.routePoints.checkpoint",
        "patrolAssignment.shift",
        "checkpoint",
      ],
    });

    if (!checkpointRecord) {
      throw new Error("El registro de checkpoint no existe");
    }

    return this.formatResponse(checkpointRecord);
  }

  async findAll(
    filters: CheckpointRecordFilterRequest = {}
  ): Promise<CheckpointRecordResponse[]> {
    const queryBuilder = this.checkpointRecordRepository
      .createQueryBuilder("checkpointRecord")
      .leftJoinAndSelect(
        "checkpointRecord.patrolAssignment",
        "patrolAssignment"
      )
      .leftJoinAndSelect("patrolAssignment.user", "user")
      .leftJoinAndSelect("patrolAssignment.patrol", "patrol")
      .leftJoinAndSelect("patrolAssignment.shift", "shift")
      .leftJoinAndSelect("checkpointRecord.checkpoint", "checkpoint")
      .leftJoinAndSelect("patrol.routePoints", "routePoints")
      .leftJoinAndSelect("routePoints.checkpoint", "routeCheckpoint");

    if (filters.patrol_assignment_id) {
      queryBuilder.andWhere("patrolAssignment.id = :patrolAssignmentId", {
        patrolAssignmentId: filters.patrol_assignment_id,
      });
    }

    if (filters.checkpoint_id) {
      queryBuilder.andWhere("checkpoint.id = :checkpointId", {
        checkpointId: filters.checkpoint_id,
      });
    }

    if (filters.status) {
      queryBuilder.andWhere("checkpointRecord.status = :status", {
        status: filters.status,
      });
    }

    if (filters.date_from) {
      queryBuilder.andWhere("checkpointRecord.check_time >= :dateFrom", {
        dateFrom: new Date(filters.date_from),
      });
    }

    if (filters.date_to) {
      queryBuilder.andWhere("checkpointRecord.check_time <= :dateTo", {
        dateTo: new Date(filters.date_to),
      });
    }

    queryBuilder.orderBy("checkpointRecord.created_at", "DESC");

    const records = await queryBuilder.getMany();

    return records.map((record) => this.formatResponse(record));
  }

  async findAllByBranchId(branchId: number): Promise<any[]> {
    const queryBuilder = this.checkpointRecordRepository
      .createQueryBuilder("checkpointRecord")
      .leftJoinAndSelect(
        "checkpointRecord.patrolAssignment",
        "patrolAssignment"
      )
      .leftJoinAndSelect("patrolAssignment.user", "user")
      .leftJoinAndSelect("patrolAssignment.patrol", "patrol")
      .leftJoinAndSelect("patrolAssignment.shift", "shift")
      .leftJoinAndSelect("checkpointRecord.checkpoint", "checkpoint")
      .leftJoinAndSelect("checkpoint.branch", "branch")
      .leftJoinAndSelect("patrol.routePoints", "routePoints")
      .leftJoinAndSelect("routePoints.checkpoint", "routeCheckpoint")
      .where("checkpoint.branch.id = :branchId", { branchId })
      .orderBy("checkpointRecord.created_at", "DESC");

    const records = await queryBuilder.getMany();

    // Agrupar por patrol assignment para evitar duplicados
    const groupedByAssignment = new Map();

    records.forEach((record) => {
      const assignmentId = record.patrolAssignment.id;

      if (!groupedByAssignment.has(assignmentId)) {
        // Crear nueva entrada para esta asignación
        groupedByAssignment.set(assignmentId, {
          id: assignmentId,
          date: record.patrolAssignment.date,
          user: {
            id: record.patrolAssignment.user.id,
            name: record.patrolAssignment.user.name,
            last_name: record.patrolAssignment.user.last_name,
          },
          patrol: {
            id: record.patrolAssignment.patrol.id,
            name: record.patrolAssignment.patrol.name,
          },
          shift: {
            id: record.patrolAssignment.shift.id,
            name: record.patrolAssignment.shift.name,
          },
          // TODOS los checkpoints de la ruta (para dibujar el mapa)
          routeCheckpoints:
            record.patrolAssignment.patrol.routePoints?.map((routePoint) => ({
              id: routePoint.checkpoint.id,
              name: routePoint.checkpoint.name,
              nfc_uid: routePoint.checkpoint.nfc_uid,
              order: routePoint.order,
              latitude: routePoint.latitude,
              longitude: routePoint.longitude,
            })) || [],
          // Solo los checkpoint records marcados
          checkpointRecords: [],
        });
      }

      // Agregar este checkpoint record (que SÍ existe)
      const assignment = groupedByAssignment.get(assignmentId);
      assignment.checkpointRecords.push({
        id: record.checkpoint.id,
        name: record.checkpoint.name,
        nfc_uid: record.checkpoint.nfc_uid,
        order:
          record.patrolAssignment.patrol.routePoints?.find(
            (rp) => rp.checkpoint.id === record.checkpoint.id
          )?.order || 0,
        latitude:
          record.patrolAssignment.patrol.routePoints?.find(
            (rp) => rp.checkpoint.id === record.checkpoint.id
          )?.latitude || null,
        longitude:
          record.patrolAssignment.patrol.routePoints?.find(
            (rp) => rp.checkpoint.id === record.checkpoint.id
          )?.longitude || null,
        status: record.status,
        check_time: record.check_time,
        real_check: record.real_check,
        created_at: record.created_at,
      });
    });

    // Convertir el Map a array y ordenar por fecha
    return Array.from(groupedByAssignment.values()).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async findByIdWithFullInfo(id: number): Promise<CheckpointRecordResponse> {
    const checkpointRecord = await this.checkpointRecordRepository.findOne({
      where: { id },
      relations: [
        "patrolAssignment",
        "patrolAssignment.user",
        "patrolAssignment.patrol",
        "patrolAssignment.patrol.routePoints",
        "patrolAssignment.patrol.routePoints.checkpoint",
        "patrolAssignment.shift",
        "checkpoint",
        "checkpoint.branch",
      ],
    });

    if (!checkpointRecord) {
      throw new Error("El registro de checkpoint no existe");
    }

    return this.formatResponse(checkpointRecord);
  }

  async findAllByPatrolAssignmentId(
    patrolAssignmentId: number
  ): Promise<CheckpointRecordResponse[]> {
    const queryBuilder = this.checkpointRecordRepository
      .createQueryBuilder("checkpointRecord")
      .leftJoinAndSelect(
        "checkpointRecord.patrolAssignment",
        "patrolAssignment"
      )
      .leftJoinAndSelect("patrolAssignment.user", "user")
      .leftJoinAndSelect("patrolAssignment.patrol", "patrol")
      .leftJoinAndSelect("patrolAssignment.shift", "shift")
      .leftJoinAndSelect("checkpointRecord.checkpoint", "checkpoint")
      .leftJoinAndSelect("patrol.routePoints", "routePoints")
      .leftJoinAndSelect("routePoints.checkpoint", "routeCheckpoint")
      .where("patrolAssignment.id = :patrolAssignmentId", {
        patrolAssignmentId,
      })
      .orderBy("checkpointRecord.created_at", "DESC");

    const records = await queryBuilder.getMany();
    return records.map((record) => this.formatResponse(record));
  }

  async delete(id: number): Promise<void> {
    const checkpointRecord = await this.checkpointRecordRepository.findOne({
      where: { id },
    });

    if (!checkpointRecord) {
      throw new Error("El registro de checkpoint no existe");
    }

    await this.checkpointRecordRepository.softDelete(id);
  }

  private formatResponse(
    checkpointRecord: CheckpointRecord
  ): CheckpointRecordResponse {
    // Buscar las coordenadas en patrol_route_points
    const routePoint =
      checkpointRecord.patrolAssignment.patrol.routePoints?.find(
        (rp) => rp.checkpoint.id === checkpointRecord.checkpoint.id
      );

    return {
      id: checkpointRecord.id,
      check_time: checkpointRecord.check_time.toISOString(),
      real_check: checkpointRecord.real_check?.toISOString(),
      patrol_assignment: {
        id: checkpointRecord.patrolAssignment.id,
        date: checkpointRecord.patrolAssignment.date.toISOString(),
        user: {
          id: checkpointRecord.patrolAssignment.user.id,
          name: checkpointRecord.patrolAssignment.user.name,
          last_name: checkpointRecord.patrolAssignment.user.last_name,
        },
        patrol: {
          id: checkpointRecord.patrolAssignment.patrol.id,
          name: checkpointRecord.patrolAssignment.patrol.name,
        },
        shift: {
          id: checkpointRecord.patrolAssignment.shift.id,
          name: checkpointRecord.patrolAssignment.shift.name,
        },
      },
      checkpoint: {
        id: checkpointRecord.checkpoint.id,
        name: checkpointRecord.checkpoint.name,
        nfc_uid: checkpointRecord.checkpoint.nfc_uid,
        latitude: routePoint?.latitude || null,
        longitude: routePoint?.longitude || null,
        status: checkpointRecord.status,
      },
      created_at: checkpointRecord.created_at.toISOString(),
      updated_at: checkpointRecord.updated_at.toISOString(),
    };
  }
}
