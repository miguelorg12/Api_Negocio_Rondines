import { AppDataSource } from "@configs/data-source";
import { CreateGuardDto, PartialCreateGuardDto } from "@dto/guard.dto";
import { PatrolAssignment } from "@interfaces/entity/patrol_assigment.entity";
import { Patrol } from "@interfaces/entity/patrol.entity";
import { User } from "@interfaces/entity/user.entity";
import { Repository } from "typeorm";

export class GuardService {
  private userRepository: Repository<User>;
  private patrolAssignmentRepository: Repository<PatrolAssignment>;
  private patrolRepository: Repository<Patrol>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.patrolAssignmentRepository =
      AppDataSource.getRepository(PatrolAssignment);
    this.patrolRepository = AppDataSource.getRepository(Patrol);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find({
      where: { role: { name: "Guard" } },
      select: ["id", "name", "curp"],
    });
  }

  async create(guard: CreateGuardDto): Promise<User> {
    const newGuard = this.userRepository.create({
      ...guard,
      role: { id: guard.role_id },
      branches: [{ id: guard.branch_id }],
    });
    return await this.userRepository.save(newGuard);
  }

  async findById(id: number): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id, role: { name: "Guard" } },
      relations: ["role", "branches"],
      select: {
        id: true,
        name: true,
        last_name: true,
        curp: true,
        email: true,
        active: true,
        role: {
          id: true,
          name: true,
        },
        branches: {
          id: true,
          name: true,
        },
      },
    });
  }

  async update(
    id: number,
    guardData: PartialCreateGuardDto
  ): Promise<User | null> {
    const guard = await this.findById(id);
    if (!guard) {
      throw new Error("Guard not found");
    }
    await this.userRepository.update(id, guardData);
    return this.findById(id);
  }

  async delete(id: number): Promise<User | null> {
    const guard = await this.findById(id);
    if (!guard) {
      throw new Error("Guard not found");
    }
    await this.userRepository.update(id, {
      active: guard.active ? false : true,
    });
    return this.findById(id);
  }

  async findByBranch(branchId: number): Promise<User[]> {
    return await this.userRepository.find({
      where: { branches: { id: branchId }, role: { name: "Guard" } },
      relations: ["role", "branches"],
    });
  }

  async patrolsAssignedToGuard(id: number): Promise<PatrolAssignment[] | null> {
    return await this.patrolAssignmentRepository.find({
      where: { user: { id } },
      relations: ["patrol", "shift"],
      select: {
        id: true,
        date: true,
        patrol: {
          id: true,
          name: true,
        },
        shift: {
          id: true,
          name: true,
        },
      },
    });
  }
}
