import { AppDataSource } from "@configs/data-source";
import { Patrol } from "@interfaces/entity/patrol.entity";
import { PatrolDto, PartialPatrolDto } from "@interfaces/dto/patrol.dto";
import { Repository } from "typeorm";

export class PatrolService {
  private patrolRepository: Repository<Patrol>;

  constructor() {
    this.patrolRepository = AppDataSource.getRepository(Patrol);
  }

  async create(patrolDto: PatrolDto): Promise<Patrol> {
    const patrol = this.patrolRepository.create(patrolDto);
    return await this.patrolRepository.save(patrol);
  }

  async getAll(): Promise<Patrol[]> {
    return await this.patrolRepository.find();
  }

  async getById(id: number): Promise<Patrol | null> {
    return await this.patrolRepository.findOneBy({ id });
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
}
