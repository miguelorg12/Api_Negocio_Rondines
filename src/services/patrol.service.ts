import { AppDataSource } from "@configs/data-source";
import { Patrol } from "@interfaces/entity/patrol.entity";
import { PatrolRoutePoint } from "@interfaces/entity/patrol_route_point.entity";
import {
  PatrolDto,
  PartialPatrolDto,
  PatrolAssigmentDto,
} from "@interfaces/dto/patrol.dto";
import { CreatePatrolWithRoutePointsDto } from "@interfaces/dto/patrol_route_point.dto";
import { Repository } from "typeorm";
import { PatrolRecordService } from "@services/patrol_record.service";

export class PatrolService {
  private patrolRepository: Repository<Patrol>;
  private patrolRoutePointRepository: Repository<PatrolRoutePoint>;
  private patrolRecordService: PatrolRecordService;

  constructor() {
    this.patrolRepository = AppDataSource.getRepository(Patrol);
    this.patrolRoutePointRepository =
      AppDataSource.getRepository(PatrolRoutePoint);
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
      relations: ["branch", "routePoints", "routePoints.checkpoint"],
    });

    return patrol;
  }

  async getByIdWithRoutePoints(id: number): Promise<Patrol | null> {
    const patrol = await this.patrolRepository.findOne({
      where: { id },
      relations: ["branch", "routePoints", "routePoints.checkpoint"],
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
        routePoints: {
          checkpoint: true,
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
        routePoints: {
          id: true,
          latitude: true,
          longitude: true,
          order: true,
          google_place_id: true,
          address: true,
          formatted_address: true,
          checkpoint: {
            id: true,
            name: true,
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

  async createPatrolWithRoutePoints(
    createPatrolDto: CreatePatrolWithRoutePointsDto
  ): Promise<Patrol> {
    // 1. Crear el patrol primero

    let patrol = this.patrolRepository.create({
      name: createPatrolDto.name,
      active: createPatrolDto.active,
      branch: { id: createPatrolDto.branch_id },
    });
    patrol = await this.patrolRepository.save(patrol);

    // 2. Crear los puntos de ruta asociados al patrol creado
    if (
      createPatrolDto.route_points &&
      createPatrolDto.route_points.length > 0
    ) {
      const routePointsToCreate = createPatrolDto.route_points.map((point) => ({
        latitude: point.latitude,
        longitude: point.longitude,
        order: point.order,
        google_place_id: point.google_place_id,
        address: point.address,
        formatted_address: point.formatted_address,
        patrol: { id: patrol.id },
        checkpoint: { id: point.checkpoint_id },
      }));

      await this.patrolRoutePointRepository.save(routePointsToCreate);
    }

    // 3. Crear el registro de patrol
    this.patrolRecordService.create({
      date: new Date(),
      status: "pendiente",
    });

    return patrol;
  }
}
