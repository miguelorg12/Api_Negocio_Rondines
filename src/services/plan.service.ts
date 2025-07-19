import { AppDataSource } from "@configs/data-source";
import { CreatePlanDto, PartialCreatePlanDto } from "@interfaces/dto/plan.dto";
import { Plan } from "@interfaces/entity/plan.entity";
import { Repository } from "typeorm";

export class PlanService {
  private planRepository: Repository<Plan>;

  constructor() {
    this.planRepository = AppDataSource.getRepository(Plan);
  }

  async findAll(): Promise<Plan[]> {
    return await this.planRepository.find();
  }

  async create(plan: CreatePlanDto): Promise<Plan> {
    return await this.planRepository.save(plan);
  }

  async findById(id: number): Promise<Plan | null> {
    return await this.planRepository.findOne({
      where: { id },
      relations: ["checkpoints"],
    });
  }

  async update(
    id: number,
    planData: PartialCreatePlanDto
  ): Promise<Plan | null> {
    const plan = await this.findById(id);
    if (!plan) {
      throw new Error("Plan not found");
    }
    await this.planRepository.update(id, planData);
    return this.findById(id);
  }

  async delete(id: number): Promise<Plan | null> {
    const plan = await this.findById(id);
    if (!plan) {
      throw new Error("Plan not found");
    }
    await this.planRepository.softDelete({ id });
    return plan;
  }
}
