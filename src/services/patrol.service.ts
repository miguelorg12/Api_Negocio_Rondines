import { AppDataSource } from "@configs/data-source";
import { Patrol } from "@interfaces/entity/patrol.entity";
import {
  PatrolDto,
  PartialPatrolDto,
  PatrolAssigmentDto,
} from "@interfaces/dto/patrol.dto";
import { Repository } from "typeorm";
import { PatrolRecordService } from "@services/patrol_record.service";

export class PatrolService {
  private patrolRepository: Repository<Patrol>;
  private patrolRecordService: PatrolRecordService;

  constructor() {
    this.patrolRepository = AppDataSource.getRepository(Patrol);
    this.patrolRecordService = new PatrolRecordService();
  }

  async create(patrolDto: PatrolDto): Promise<Patrol> {
    let patrol = this.patrolRepository.create(patrolDto);
    return await this.patrolRepository.save(patrolDto);
  }

  async getAll(): Promise<Patrol[]> {
    return await this.patrolRepository.find({
      relations: ["branch"],
    });
  }

  async getById(id: number): Promise<Patrol | null> {
    const patrol = await this.patrolRepository.findOne({
      where: { id },
      relations: ["branch"],
    });

    return patrol;
  }

  async getPatrolsByBranchId(id: number) {
    return await this.patrolRepository.find({
      where: { branch: { id } },
      relations: {
        patrolAssignments: {
          shift: true,
        },
      },
      select: {
        id: true,
        name: true,
        active: true,
        patrolAssignments: {
          id: true,
          date: true,
          shift: {
            id: true,
            name: true,
            start_time: true,
            end_time: true,
            created_at: true,
          },
        },
      },
    });
  }

  /**
   * Obtener patrols disponibles (sin asignaciones) por sucursal
   */
  async getAvailablePatrolsByBranchId(id: number) {
    // Obtener patrols de la sucursal que NO tienen asignaciones
    const patrols = await this.patrolRepository
      .createQueryBuilder("patrol")
      .leftJoin("patrol.patrolAssignments", "assignment")
      .where("patrol.branch.id = :branchId", { branchId: id })
      .andWhere("assignment.id IS NULL") // Solo patrols sin asignaciones
      .select(["patrol.id", "patrol.name", "patrol.active"])
      .getMany();

    return patrols;
  }

  async update(
    id: number,
    patrolDto: PartialPatrolDto
  ): Promise<Patrol | null> {
    const patrol = await this.getById(id);
    if (!patrol) {
      throw new Error("Ronda no encontrada");
    }
    await this.patrolRepository.update(id, patrolDto);
    return this.getById(id);
  }

  async delete(id: number): Promise<Patrol | null> {
    const patrol = await this.getById(id);
    if (!patrol) {
      throw new Error("Ronda no encontrada");
    }
    await this.patrolRepository.update(id, {
      active: patrol.active ? false : true,
    });
    return this.getById(id);
  }

  async createPatrolAndAssigment(
    patrolDto: PatrolAssigmentDto
  ): Promise<Patrol> {
    let patrol = this.patrolRepository.create(patrolDto);
    patrol = await this.patrolRepository.save(patrolDto);

    // Crear el registro de patrol (sin user_id y patrol_id ya que no existen en la entidad)
    this.patrolRecordService.create({
      date: new Date(),
      status: "pendiente",
    });

    return patrol;
  }
}
