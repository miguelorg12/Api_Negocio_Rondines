import { AppDataSource } from "@configs/data-source";
import { PatrolAssignment } from "@interfaces/entity/patrol_assigment.entity";
import { PatrolRecordService } from "@services/patrol_record.service";
import { Patrol } from "@interfaces/entity/patrol.entity";
import {
  PatrolAssignmentDto,
  PartialPatrolAssignmentDto,
  RouteAssignmentWithCheckpointsDto,
  UpdateRouteWithCheckpointsDto,
} from "@interfaces/dto/patrol_assigment.dto";
import { Repository } from "typeorm";

export class PatrolAssignmentService {
  private patrolAssignmentRepository: Repository<PatrolAssignment>;
  private patrolRecordService: PatrolRecordService;
  private patrolRepository: Repository<Patrol>;

  constructor() {
    this.patrolAssignmentRepository =
      AppDataSource.getRepository(PatrolAssignment);
    this.patrolRecordService = new PatrolRecordService();
    this.patrolRepository = AppDataSource.getRepository(Patrol);
  }

  async create(
    patrolAssignmentDto: PatrolAssignmentDto
  ): Promise<PatrolAssignment> {
    const patrolAssignment =
      this.patrolAssignmentRepository.create(patrolAssignmentDto);

    const savedAssignment = await this.patrolAssignmentRepository.save(
      patrolAssignment
    );

    // Crear el registro de patrol asociado al PatrolAssignment
    await this.patrolRecordService.create({
      date: patrolAssignmentDto.date,
      status: "pendiente",
      patrol_assignment_id: savedAssignment.id,
    });

    return savedAssignment;
  }

  /**
   * Crear asignación de ruta
   */
  async createRouteWithCheckpoints(
    routeData: RouteAssignmentWithCheckpointsDto
  ): Promise<PatrolAssignment> {
    // Obtener el patrol
    const patrol = await this.patrolRepository.findOne({
      where: { id: routeData.patrol_id },
    });

    if (!patrol) {
      throw new Error("Patrol no encontrado");
    }

    // Crear la asignación de patrol
    const patrolAssignment = this.patrolAssignmentRepository.create({
      user: { id: routeData.user_id },
      patrol: { id: routeData.patrol_id },
      shift: { id: routeData.shift_id },
      date: routeData.date,
    });

    const savedAssignment = await this.patrolAssignmentRepository.save(
      patrolAssignment
    );

    // Crear el registro de patrol asociado al PatrolAssignment
    console.log(
      "Creando PatrolRecord con patrol_assignment_id:",
      savedAssignment.id
    );
    const patrolRecord = await this.patrolRecordService.create({
      date: routeData.date, // Usar la misma fecha del assignment
      status: "pendiente",
      patrol_assignment_id: savedAssignment.id,
    });

    console.log("PatrolRecord creado:", patrolRecord);

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
      relations: ["user", "patrol", "shift", "patrolRecords"],
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

    // Soft delete de la asignación
    await this.patrolAssignmentRepository.softDelete(id);

    return existingAssignment;
  }
}
