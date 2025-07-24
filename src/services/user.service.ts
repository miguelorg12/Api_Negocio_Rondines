import { AppDataSource } from "@configs/data-source";
import { CreateUserDto, PartialCreateUserDto } from "@dto/user.dto";
import { User } from "@entities/user.entity";
import { Repository } from "typeorm";

export class UserService {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find({ relations: ["role"] });
  }

  async create(user: CreateUserDto): Promise<User> {
    return await this.userRepository.save(user);
  }

  async findById(id: number): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id },
    });
  }

  async update(
    id: number,
    userData: PartialCreateUserDto
  ): Promise<User | null> {
    const user = await this.findById(id);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }
    await this.userRepository.update(id, userData);
    return this.findById(id);
  }

  async delete(id: number): Promise<User | null> {
    const user = await this.findById(id);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }
    await this.userRepository.update(id, {
      active: user.active ? false : true,
    });
    return this.findById(id);
  }

  async findAllGuards(): Promise<User[]> {
    return await this.userRepository.find({
      where: { role: { name: "Guard" } },
      relations: ["role"],
    });
  }

  async findGuardById(id: number): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id, role: { name: "Guard" } },
      relations: ["role"],
    });
  }
}
