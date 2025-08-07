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
    this.checkpointRecordRepository = AppDataSource.getRepository(CheckpointRecord);
    this.patrolAssignmentRepository = AppDataSource.getRepository(PatrolAssignment);
    this.checkpointRepository = AppDataSource.getRepository(Checkpoint);
  }

  async create(data: CheckpointRecordCreateRequest): Promise<CheckpointRecordResponse> {
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
      throw new Error("Ya existe un registro para esta asignación y checkpoint");
    }

    const checkpointRecord = this.checkpointRecordRepository.create({
      patrolAssignment,
      checkpoint,
      check_time: new Date(data.check_time),
      status: "pending",
    });

    const savedRecord = await this.checkpointRecordRepository.save(checkpointRecord);

    return this.formatResponse(savedRecord);
  }

  async update(id: number, data: CheckpointRecordUpdateRequest): Promise<CheckpointRecordResponse> {
    const checkpointRecord = await this.checkpointRecordRepository.findOne({
      where: { id },
      relations: ["patrolAssignment", "patrolAssignment.user", "patrolAssignment.patrol", "patrolAssignment.shift", "checkpoint"],
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

    const updatedRecord = await this.checkpointRecordRepository.save(checkpointRecord);

    return this.formatResponse(updatedRecord);
  }

  async findById(id: number): Promise<CheckpointRecordResponse> {
    const checkpointRecord = await this.checkpointRecordRepository.findOne({
      where: { id },
      relations: ["patrolAssignment", "patrolAssignment.user", "patrolAssignment.patrol", "patrolAssignment.shift", "checkpoint"],
    });

    if (!checkpointRecord) {
      throw new Error("El registro de checkpoint no existe");
    }

    return this.formatResponse(checkpointRecord);
  }

  async findAll(filters: CheckpointRecordFilterRequest = {}): Promise<CheckpointRecordResponse[]> {
    const queryBuilder = this.checkpointRecordRepository
      .createQueryBuilder("checkpointRecord")
      .leftJoinAndSelect("checkpointRecord.patrolAssignment", "patrolAssignment")
      .leftJoinAndSelect("patrolAssignment.user", "user")
      .leftJoinAndSelect("patrolAssignment.patrol", "patrol")
      .leftJoinAndSelect("patrolAssignment.shift", "shift")
      .leftJoinAndSelect("checkpointRecord.checkpoint", "checkpoint");

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

  async findAllByBranchId(branchId: number): Promise<CheckpointRecordResponse[]> {
    const queryBuilder = this.checkpointRecordRepository
      .createQueryBuilder("checkpointRecord")
      .leftJoinAndSelect("checkpointRecord.patrolAssignment", "patrolAssignment")
      .leftJoinAndSelect("patrolAssignment.user", "user")
      .leftJoinAndSelect("patrolAssignment.patrol", "patrol")
      .leftJoinAndSelect("patrolAssignment.shift", "shift")
      .leftJoinAndSelect("checkpointRecord.checkpoint", "checkpoint")
      .leftJoinAndSelect("checkpoint.branch", "branch")
      .leftJoinAndSelect("patrol.routePoints", "routePoints")
      .leftJoinAndSelect("routePoints.checkpoint", "routeCheckpoint")
      .where("branch.id = :branchId", { branchId })
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

  private formatResponse(checkpointRecord: CheckpointRecord): CheckpointRecordResponse {
    // Buscar las coordenadas en patrol_route_points
    const routePoint = checkpointRecord.patrolAssignment.patrol.routePoints?.find(
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
