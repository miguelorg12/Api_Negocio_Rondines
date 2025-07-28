import { AppDataSource } from "@configs/data-source";
import { Patrol } from "@interfaces/entity/patrol.entity";
import { PatrolDto, PartialPatrolDto } from "@interfaces/dto/patrol.dto";
import { Repository } from "typeorm";
import { PlanService } from "@services/plan.service";
import { PatrolRecordService } from "@services/patrol_record.service";

export class PatrolService {
  private patrolRepository: Repository<Patrol>;
  private planService: PlanService;
  private patrolRecordService: PatrolRecordService;
  constructor() {
    this.patrolRepository = AppDataSource.getRepository(Patrol);
    this.planService = new PlanService();
    this.patrolRecordService = new PatrolRecordService();
  }

  async create(patrolDto: PatrolDto): Promise<Patrol> {
    let patrol = this.patrolRepository.create(patrolDto);

    if (patrolDto.plan_id) {
      const plan = await this.planService.findById(patrolDto.plan_id);
      if (!plan) {
        throw new Error("Plan not found");
      }
      const checkpoints = plan.checkpoints;
      if (checkpoints && checkpoints.length > 0) {
        patrol = this.patrolRepository.create({
          ...patrolDto,
          checkpoints: checkpoints,
        });
      }
    }
    return await this.patrolRepository.save(patrolDto);
  }

  async getAll(): Promise<Patrol[]> {
    return await this.patrolRepository.find();
  }

  async getById(id: number): Promise<Patrol | null> {
    return await this.patrolRepository.findOne({ where: { id } });
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

  async createPatrolAndAssigment(patrolDto: PatrolDto): Promise<Patrol> {
    let patrol = this.patrolRepository.create(patrolDto);

    if (patrolDto.plan_id) {
      const plan = await this.planService.findById(patrolDto.plan_id);
      if (!plan) {
        throw new Error("Plan not found");
      }
      const checkpoints = plan.checkpoints;
      if (checkpoints && checkpoints.length > 0) {
        patrol = this.patrolRepository.create({
          ...patrolDto,
          checkpoints: checkpoints,
        });
      }
    }
    patrol = await this.patrolRepository.save(patrolDto);
    this.patrolRecordService.create({
      user_id: patrolDto.branch_id, // Assuming branch_id is the user_id for the patrol record
      patrol_id: patrol.id,
      date: new Date(),
      status: "pendiente",
    });
    return patrol;
  }
}
